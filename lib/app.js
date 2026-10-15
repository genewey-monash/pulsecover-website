'use strict';
// PulseCover API (website + mobile app). Runs as a Vercel function (api/[...path].js) and locally through server.js.
// Data lives in Supabase Postgres (DATABASE_URL). Group 5, BFM3130.
const crypto = require('node:crypto');
const P = require('../pricing');
const db = require('./db');
const SCHEMA = require('./schema');

let waitUntil = null;
try { ({ waitUntil } = require('@vercel/functions')); } catch { /* not on Vercel */ }
// Keep a background promise (email/sheet webhook) alive after the response has been sent.
const bg = (p) => { const q = Promise.resolve(p).catch(() => {}); try { if (waitUntil) waitUntil(q); } catch { /* no request context */ } return q; };

const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const rid = (n) => crypto.randomBytes(n).toString('hex').toUpperCase();
const hash = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex');
const age = (dob) => { const d = new Date(dob); if (isNaN(d)) return -1; const t = new Date(); let a = t.getFullYear() - d.getFullYear(); const m = t.getMonth() - d.getMonth(); if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--; return a; };
// Valid email = something@domain.tld (needs "@", a dot in the domain and a 2+ letter ending such as .com or .edu.my).
const emailOk = (e) => typeof e === 'string' && e.length < 255 && /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/.test(e) && !/\.\./.test(e);
const LANGS = ['en', 'zh', 'ms', 'ta'];
const langOf = (v) => (LANGS.includes(v) ? v : 'en');
const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Google Sheets + email via a Google Apps Script web app (see google-apps-script/). Passwords are NEVER sent.
const HOOK = process.env.SHEET_WEBHOOK_URL || '', HOOK_SECRET = process.env.SHEET_SECRET || '';
function notify(action, data) {
  if (!HOOK) { console.log('[sheet-webhook not configured]', action); return; }
  bg(fetch(HOOK, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ secret: HOOK_SECRET, action, data }), redirect: 'follow', signal: AbortSignal.timeout(25000) })
    .then((r) => r.text()).then((t) => console.log('[sheet-webhook]', action, t.slice(0, 120))).catch((e) => console.error('[sheet-webhook failed]', action, e.message)));
}

class HttpError extends Error { constructor(code, msg) { super(msg); this.code = code; } }
const bad = (msg, code = 400) => { throw new HttpError(code, msg); };

// naive in-memory rate limit per IP and per server instance (120 API req / minute, 10 auth attempts / 10 min)
const hits = new Map();
function limit(key, max, windowMs) {
  const t = Date.now(); const arr = (hits.get(key) || []).filter((x) => t - x < windowMs);
  arr.push(t); hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  if (arr.length > max) bad('Too many requests, please slow down.', 429);
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) { // Vercel parses the body before the function runs
    let b = req.body;
    if (Buffer.isBuffer(b)) b = b.toString();
    if (typeof b === 'string') { if (!b.length) return {}; try { b = JSON.parse(b); } catch { throw new HttpError(400, 'Invalid JSON'); } }
    return b && typeof b === 'object' ? b : {};
  }
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > 100_000) { reject(new HttpError(413, 'Payload too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { if (!chunks.length) return resolve({}); try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch { reject(new HttpError(400, 'Invalid JSON')); } });
  });
}
const ipOf = (req) => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || (req.socket && req.socket.remoteAddress) || 'unknown';
function cookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((x) => x[0])); }
const tokenOf = (req) => { const a = String(req.headers.authorization || ''); return a.startsWith('Bearer ') ? a.slice(7).trim() : (cookies(req).pc_session || ''); };

async function userFrom(req) {
  if (req.pcUser !== undefined) return req.pcUser;
  const tok = tokenOf(req);
  req.pcUser = tok ? (await db.get('SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>?', tok, Date.now())) || null : null;
  return req.pcUser;
}
const IDLE_MS = 30 * 60 * 1000; // logged out after 30 minutes without activity; renewed on every API call
const SECURE = process.env.VERCEL || process.env.RENDER ? '; Secure' : '';
const sessionCookie = (token) => `pc_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${IDLE_MS / 1000}${SECURE}`;
const needUser = async (req) => (await userFrom(req)) || bad('Please log in first.', 401);
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, dob: u.dob, lang: u.lang, refcode: u.refcode, phone: u.phone || '', address: u.address || '' });

async function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await db.run('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)', token, userId, Date.now() + IDLE_MS);
  bg(db.run('DELETE FROM sessions WHERE expires<?', Date.now()));
  res.setHeader('Set-Cookie', sessionCookie(token)); res.pcToken = token;
}

function metricsOf(m) {
  return {
    steps: P.clamp(P.num(m.steps, 0), 0, 100000), exerciseMin: P.clamp(P.num(m.exerciseMin, 0), 0, 3000),
    sleepHours: P.clamp(P.num(m.sleepHours, 0), 0, 24), restingHr: P.clamp(P.num(m.restingHr, 70), 30, 200)
  };
}
const userMetrics = (uid, days = 365) => db.all('SELECT day, steps, exercise_min AS "exerciseMin", sleep_hours AS "sleepHours", resting_hr AS "restingHr", source FROM metrics WHERE user_id=? ORDER BY day DESC LIMIT ?', uid, days);
const upsertMetric = (uid, day, m, source) => db.run(
  'INSERT INTO metrics(user_id,day,steps,exercise_min,sleep_hours,resting_hr,source) VALUES(?,?,?,?,?,?,?) ON CONFLICT (user_id, day) DO UPDATE SET steps=EXCLUDED.steps, exercise_min=EXCLUDED.exercise_min, sleep_hours=EXCLUDED.sleep_hours, resting_hr=EXCLUDED.resting_hr, source=EXCLUDED.source',
  uid, day, m.steps, m.exerciseMin, m.sleepHours, m.restingHr, source);
const policyOf = (uid) => db.get("SELECT * FROM policies WHERE user_id=? AND status='active' ORDER BY id DESC LIMIT 1", uid);

// ---- API routes ----
const routes = {};
const route = (method, p, fn) => { routes[`${method} ${p}`] = fn; };

route('POST', '/api/register', async (req, res, b) => {
  limit('auth:' + ipOf(req), 10, 600000);
  const name = str(b.name, 100), email = str(b.email, 254).toLowerCase(), pw = typeof b.password === 'string' ? b.password : '';
  if (name.length < 2) bad('Please enter your full name.');
  if (!emailOk(email)) bad('Invalid email address.');
  if (pw.length < 8) bad('Password must be at least 8 characters.');
  if (typeof b.password2 !== 'string' || b.password2 !== pw) bad('The passwords do not match. Please enter them again.');
  if (age(b.dob) < 18) bad('You must be at least 18 to register.');
  if (await db.get('SELECT 1 AS x FROM users WHERE email=?', email)) bad('An account with this email already exists.', 409);
  const salt = rid(16);
  let referred = null;
  if (b.referral) { const r = await db.get('SELECT id FROM users WHERE refcode=?', str(b.referral, 20).toUpperCase()); if (r) referred = r.id; }
  let created;
  try {
    created = await db.get('INSERT INTO users(name,email,pass,salt,dob,lang,refcode,referred_by,created) VALUES(?,?,?,?,?,?,?,?,?) RETURNING *',
      name, email, hash(pw, salt), salt, b.dob, langOf(b.lang), 'PC' + rid(3), referred, now());
  } catch (e) { if (e.code === '23505') bad('An account with this email already exists.', 409); throw e; }
  await startSession(res, created.id);
  notify('register', { name, email, lang: created.lang, refcode: created.refcode, created: created.created });
  return publicUser(created);
});

route('POST', '/api/login', async (req, res, b) => {
  limit('auth:' + ipOf(req), 10, 600000);
  const loginEmail = str(b.email, 254).toLowerCase();
  if (!emailOk(loginEmail)) bad('Invalid email address.');
  const u = await db.get('SELECT * FROM users WHERE email=?', loginEmail);
  if (!u) bad('No account found with this email. Please register first.', 401);
  if (!crypto.timingSafeEqual(Buffer.from(hash(String(b.password || ''), u.salt)), Buffer.from(u.pass))) bad('Incorrect email or password.', 401);
  await startSession(res, u.id);
  return publicUser(u);
});

route('POST', '/api/logout', async (req, res) => {
  const tok = tokenOf(req); if (tok) await db.run('DELETE FROM sessions WHERE token=?', tok);
  res.setHeader('Set-Cookie', 'pc_session=; HttpOnly; Path=/; Max-Age=0');
  return { ok: true };
});

route('POST', '/api/profile', async (req, res, b) => {
  const u = await needUser(req);
  const name = str(b.name, 100), phone = str(b.phone, 20), address = str(b.address, 200), dob = typeof b.dob === 'string' ? b.dob : u.dob;
  const lang = LANGS.includes(b.lang) ? b.lang : u.lang;
  if (name.length < 2) bad('Please enter your full name.');
  if (phone && !/^\+?[0-9][0-9 \-]{6,18}$/.test(phone)) bad('Invalid phone number.');
  if (age(dob) < 18) bad('You must be at least 18 to register.');
  const row = await db.get('UPDATE users SET name=?, phone=?, address=?, dob=?, lang=? WHERE id=? RETURNING *', name, phone, address, dob, lang, u.id);
  return publicUser(row);
});

route('POST', '/api/password', async (req, res, b) => {
  limit('auth:' + ipOf(req), 10, 600000);
  const u = await needUser(req);
  const cur = String(b.current || ''), pw = typeof b.password === 'string' ? b.password : '';
  if (!crypto.timingSafeEqual(Buffer.from(hash(cur, u.salt)), Buffer.from(u.pass))) bad('Incorrect email or password.', 401);
  if (pw.length < 8) bad('Password must be at least 8 characters.');
  if (b.password2 !== pw) bad('The passwords do not match. Please enter them again.');
  const salt = rid(16);
  await db.run('UPDATE users SET pass=?, salt=? WHERE id=?', hash(pw, salt), salt, u.id);
  await db.run('DELETE FROM sessions WHERE user_id=? AND token<>?', u.id, tokenOf(req) || '');
  return { ok: true };
});

const DEFAULT_METRICS = { steps: 7500, exerciseMin: 100, sleepHours: 7.5, restingHr: 66 };

route('POST', '/api/policy', async (req, res, b) => {
  const u = await needUser(req);
  const pol = await policyOf(u.id); if (!pol) bad('You do not have a policy yet.', 404);
  let plan = pol.plan, beneficiary = pol.beneficiary, appSub = pol.app_sub;
  if (b.plan !== undefined) { if (!P.PLANS[b.plan]) bad('Choose a plan.'); plan = b.plan; }
  if (b.beneficiary !== undefined) { beneficiary = str(b.beneficiary, 100); if (beneficiary.length < 2) bad('Please add a beneficiary.'); }
  if (b.appSubscription !== undefined) appSub = b.appSubscription ? 1 : 0;
  const hist = await userMetrics(u.id, 28);
  const mm = hist.length >= 7 ? P.averageMetrics(hist) : DEFAULT_METRICS;
  const q = P.quote(mm, { appSubscription: !!appSub, plan });
  const pl = P.planOf(plan);
  await db.run('UPDATE policies SET plan=?, cover=?, base=?, premium=?, app_sub=?, beneficiary=? WHERE id=?', plan, pl.cover, q.base, q.annualPremium, appSub, beneficiary, pol.id);
  return { policy: await policyOf(u.id) };
});

route('POST', '/api/policy/preview', async (req) => {
  const u = await needUser(req);
  const [pol, hist] = await Promise.all([policyOf(u.id), userMetrics(u.id, 28)]);
  const mm = hist.length >= 7 ? P.averageMetrics(hist) : DEFAULT_METRICS;
  return Object.values(P.PLANS).map((pl) => ({ id: pl.id, cover: pl.cover, base: pl.base, premium: P.quote(mm, { appSubscription: !!(pol && pol.app_sub), plan: pl.id }).annualPremium }));
});

route('GET', '/api/health', async () => {
  const r = await db.get('SELECT COUNT(*)::int AS c FROM users');
  return { ok: true, uptimeSeconds: Math.round(process.uptime()), accounts: r.c, database: 'supabase', emails: !!HOOK, backupEnabled: false, restored: true };
});

route('GET', '/api/me', async (req) => { const u = await userFrom(req); return { user: u ? publicUser(u) : null }; });

route('POST', '/api/lang', async (req, res, b) => {
  const u = await userFrom(req); if (u && LANGS.includes(b.lang)) await db.run('UPDATE users SET lang=? WHERE id=?', b.lang, u.id);
  return { ok: true };
});

route('GET', '/api/plans', () => Object.values(P.PLANS));
route('POST', '/api/quote', (req, res, b) => P.quote(metricsOf(b), { appSubscription: !!b.appSubscription, plan: b.plan }));
route('POST', '/api/sme/quote', (req, res, b) => P.smeQuote(b.employees, b.avgScore));
route('GET', '/api/financials', () => P.financials());

route('POST', '/api/apply', async (req, res, b) => {
  const u = await needUser(req);
  if (await db.get("SELECT 1 AS x FROM policies WHERE user_id=? AND status IN ('active','pending')", u.id)) bad('You already have a policy.', 409);
  const guardian = str(b.guardian, 100);
  if (age(u.dob) < 18 && guardian.length < 2) bad('A parent or guardian name is required for applicants under 18.');
  if (!b.consentData || !b.consentTerms) bad('You must accept the data consent and the pricing terms.');
  if (!['fitbit', 'garmin', 'whoop', 'healthconnect', 'manual'].includes(b.device)) bad('Choose a wearable device.');
  const plan = P.planOf(b.plan);
  const cover = plan.cover;
  const beneficiary = str(b.beneficiary, 100);
  if (beneficiary.length < 2) bad('Please add a beneficiary.');
  const hist28 = await userMetrics(u.id, 28);
  const mm = hist28.length >= 7 ? P.averageMetrics(hist28) : metricsOf(b);
  const q = P.quote(mm, { appSubscription: !!b.appSubscription, plan: plan.id });
  const number = 'PC-' + new Date().getFullYear() + '-' + rid(3);
  // First year: indicative premium from the quote metrics; repricing at renewal from 12-month average.
  await db.run('INSERT INTO policies(user_id,plan,number,status,device,cover,base,premium,app_sub,guardian,beneficiary,start_date,renewal_date,created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    u.id, plan.id, number, 'active', b.device, cover, q.base, q.annualPremium, b.appSubscription ? 1 : 0, guardian, beneficiary, today(), addDays(today(), 365), now());
  if (!hist28.length) { const m = metricsOf(b); await upsertMetric(u.id, today(), { steps: m.steps, exerciseMin: m.exerciseMin / 7, sleepHours: m.sleepHours, restingHr: m.restingHr }, b.device); }
  notify('application', { name: u.name, email: u.email, number, plan: plan.id, cover, premium: q.annualPremium, grade: q.grade, score: q.score, device: b.device, beneficiary, guardian, lang: langOf(b.lang || u.lang), created: now() });
  return { number, quote: q };
});

function weeklySummary(rowsDesc) {
  const rows = [...rowsDesc].reverse();
  const weeks = new Map();
  for (const m of rows) {
    const d = new Date(m.day); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow);
    const k = d.toISOString().slice(0, 10); if (!weeks.has(k)) weeks.set(k, []); weeks.get(k).push(m);
  }
  return [...weeks.entries()].slice(-8).map(([start, list]) => {
    const avg = P.averageMetrics(list); const sc = P.score(avg).score;
    return { start, days: list.length, steps: Math.round(avg.steps), exerciseMin: Math.round(avg.exerciseMin), sleepHours: Math.round(avg.sleepHours * 10) / 10, restingHr: Math.round(avg.restingHr), score: sc, grade: P.gradeOf(sc) };
  });
}

route('GET', '/api/dashboard', async (req) => {
  const u = await needUser(req);
  const [pol, ms, claims, refRow, rankRows, connections] = await Promise.all([
    policyOf(u.id),
    userMetrics(u.id, 90),
    db.all('SELECT * FROM claims WHERE user_id=? ORDER BY id DESC', u.id),
    db.get('SELECT COUNT(*)::int AS c FROM users WHERE referred_by=?', u.id),
    db.all('SELECT u.name, COUNT(r.id)::int AS c FROM users u JOIN users r ON r.referred_by=u.id GROUP BY u.id ORDER BY c DESC LIMIT 5'),
    db.all('SELECT provider, connected_at, last_sync FROM connections WHERE user_id=?', u.id)
  ]);
  const avg = P.averageMetrics(ms.slice(0, 30));
  const current = P.quote(avg, { appSubscription: pol ? !!pol.app_sub : false, plan: pol && pol.plan });
  const ranking = rankRows.map((r) => ({ name: r.name.split(' ')[0] + ' ' + (r.name.split(' ')[1] ? r.name.split(' ')[1][0] + '.' : ''), count: r.c }));
  const paused = pol && pol.paused_until && pol.paused_until >= today() ? pol.paused_until : null;
  const withScore = ms.map((m) => ({ ...m, score: P.score(m).score })).reverse();
  return { user: publicUser(u), policy: pol || null, metrics: withScore, projected: current, score30: ms.length ? P.score(avg).score : null, grade: ms.length ? P.gradeOf(P.score(avg).score) : null, weekly: weeklySummary(ms.slice(0, 70)), connections, paused, claims, referrals: refRow.c, ranking };
});

const PROVIDERS = ['healthconnect', 'fitbit', 'garmin', 'whoop'];
// Real Fitbit/Garmin/Whoop/Google Health Connect OAuth needs vendor partner credentials. This stores the consent and backfills
// 28 days of simulated readings through the same pipeline a real connector would feed.
async function backfill(uid, provider) {
  const have = (await db.get('SELECT COUNT(*)::int AS c FROM metrics WHERE user_id=?', uid)).c;
  if (have >= 14) return 0;
  const seed = crypto.createHash('sha256').update('profile' + uid).digest();
  const base = { steps: 5500 + (seed[0] / 255) * 5500, ex: 60 + (seed[1] / 255) * 110, sl: 6.2 + (seed[2] / 255) * 2, hr: 54 + (seed[3] / 255) * 18 };
  const params = []; const tuples = [];
  for (let i = 27; i >= 0; i--) {
    const day = addDays(today(), -i);
    const r = crypto.createHash('sha256').update(uid + day).digest();
    const wk = new Date(day).getDay() % 6 === 0 ? 0.85 : 1.05;
    params.push(uid, day, Math.round(base.steps * wk * (0.75 + (r[0] / 255) * 0.5)), Math.round((base.ex / 7) * wk * (0.6 + (r[1] / 255) * 0.9)),
      Math.round((base.sl + (r[2] / 255 - 0.5)) * 10) / 10, Math.round(base.hr + (r[3] / 255 - 0.5) * 6), provider + '-sync');
    tuples.push('(?,?,?,?,?,?,?)');
  }
  await db.run(`INSERT INTO metrics(user_id,day,steps,exercise_min,sleep_hours,resting_hr,source) VALUES ${tuples.join(',')} ON CONFLICT (user_id, day) DO NOTHING`, ...params);
  return tuples.length;
}

route('POST', '/api/connect', async (req, res, b) => {
  const u = await needUser(req);
  const provider = PROVIDERS.includes(b.provider) ? b.provider : bad('Choose a wearable to connect.');
  if (!b.consent) bad('Please approve the data permissions to connect.');
  await db.run('INSERT INTO connections(user_id,provider,connected_at,last_sync) VALUES(?,?,?,?) ON CONFLICT (user_id, provider) DO UPDATE SET connected_at=EXCLUDED.connected_at, last_sync=EXCLUDED.last_sync', u.id, provider, now(), now());
  const added = await backfill(u.id, provider);
  const hist = await userMetrics(u.id, 28);
  const q = P.quote(P.averageMetrics(hist), { plan: b.plan });
  return { provider, days: hist.length, added, quote: q };
});

route('POST', '/api/disconnect', async (req, res, b) => {
  const u = await needUser(req);
  await db.run('DELETE FROM connections WHERE user_id=? AND provider=?', u.id, String(b.provider || ''));
  return { ok: true };
});

route('POST', '/api/my-quote', async (req, res, b) => {
  const u = await needUser(req);
  const hist = await userMetrics(u.id, 28);
  if (hist.length < 7) bad('Connect a wearable first so we can build your rating.');
  return { days: hist.length, quote: P.quote(P.averageMetrics(hist), { plan: b.plan, appSubscription: !!b.appSubscription }) };
});

// Wearable sync. Real Fitbit/Garmin/Whoop OAuth needs vendor partner credentials, so this ingests either manual entries
// or a simulated device reading and stores it via the same pipeline a real connector would use.
route('POST', '/api/sync', async (req, res, b) => {
  const u = await needUser(req);
  const pol = await policyOf(u.id); if (!pol) bad('Apply for a policy first.');
  if (pol.paused_until && pol.paused_until >= today()) bad('Tracking is paused until ' + pol.paused_until + '. These days are excluded from your average.');
  let m;
  if (b.manual) m = metricsOf(b);
  else { // simulated reading, seeded by date + user for plausible, stable values
    const seed = crypto.createHash('sha256').update(u.id + today() + Date.now()).digest();
    const r = (i) => seed[i] / 255;
    m = { steps: Math.round(4500 + r(0) * 8000), exerciseMin: Math.round(10 + r(1) * 60), sleepHours: Math.round((5.8 + r(2) * 3) * 10) / 10, restingHr: Math.round(54 + r(3) * 20) };
  }
  await upsertMetric(u.id, today(), m, b.manual ? 'manual' : pol.device + '-sync');
  return { day: today(), ...m };
});

route('POST', '/api/pause', async (req, res, b) => {
  const u = await needUser(req); const pol = (await policyOf(u.id)) || bad('No active policy.');
  const days = P.clamp(Math.floor(P.num(b.days, 14)), 1, 60);
  const reason = ['illness', 'injury', 'travel', 'pregnancy', 'other'].includes(b.reason) ? b.reason : 'other';
  await db.run('UPDATE policies SET paused_until=?, pause_reason=? WHERE id=?', addDays(today(), days), reason, pol.id);
  return { pausedUntil: addDays(today(), days), reason };
});

route('POST', '/api/claims', async (req, res, b) => {
  const u = await needUser(req); const pol = (await policyOf(u.id)) || bad('You need an active policy to claim.');
  const type = ['hospitalisation', 'outpatient', 'critical_illness', 'accident', 'death'].includes(b.type) ? b.type : bad('Choose a claim type.');
  const amount = P.num(b.amount, 0); if (amount <= 0 || amount > pol.cover) bad('Enter a valid claim amount within your cover.');
  const description = str(b.description, 2000); if (description.length < 10) bad('Please describe what happened (at least 10 characters).');
  const incident = str(b.incidentDate, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(incident) || incident > today()) bad('Enter a valid incident date.');
  const number = 'CL-' + rid(3);
  const row = await db.get('INSERT INTO claims(user_id,policy_id,number,type,amount,description,incident_date,status,created) VALUES(?,?,?,?,?,?,?,?,?) RETURNING id',
    u.id, pol.id, number, type, amount, description, incident, 'received', now());
  await db.run('INSERT INTO claim_events(claim_id,status,note,created) VALUES(?,?,?,?)', row.id, 'received', 'Claim received', now());
  notify('claim', { name: u.name, email: u.email, number, type, amount, incident, description, lang: langOf(b.lang || u.lang), created: now() });
  return { number };
});

route('GET', '/api/claims', async (req) => {
  const u = await needUser(req);
  const claims = await db.all('SELECT * FROM claims WHERE user_id=? ORDER BY id DESC', u.id);
  if (!claims.length) return [];
  const events = await db.all('SELECT claim_id, status, note, created FROM claim_events WHERE claim_id IN (SELECT id FROM claims WHERE user_id=?) ORDER BY id', u.id);
  return claims.map((c) => ({ ...c, events: events.filter((e) => e.claim_id === c.id).map(({ status, note, created }) => ({ status, note, created })) }));
});

route('POST', '/api/sme/enquiry', async (req, res, b) => {
  const company = str(b.company, 150), contact = str(b.contact, 100), email = str(b.email, 254);
  if (company.length < 2 || contact.length < 2) bad('Company and contact name are required.');
  if (!emailOk(email)) bad('Invalid email address.');
  const n = Math.max(1, Math.floor(P.num(b.employees, 1)));
  const q = P.smeQuote(n, b.avgScore);
  await db.run('INSERT INTO sme(company,contact,email,phone,employees,message,quote,created) VALUES(?,?,?,?,?,?,?,?)', company, contact, email, str(b.phone, 30), n, str(b.message, 1000), JSON.stringify(q), now());
  notify('sme', { company, contact, email, phone: str(b.phone, 30), employees: n, message: str(b.message, 1000), quote: q, lang: langOf(b.lang) });
  return { ok: true, quote: q };
});

route('POST', '/api/contact', async (req, res, b) => {
  limit('contact:' + ipOf(req), 5, 600000);
  const name = str(b.name, 100), email = str(b.email, 254), msg = str(b.message, 2000);
  if (name.length < 2) bad('Please enter your name.');
  if (!emailOk(email)) bad('Invalid email address.');
  if (msg.length < 5) bad('Please write your message.');
  await db.run('INSERT INTO contact(name,email,topic,message,created) VALUES(?,?,?,?,?)', name, email, str(b.topic, 50), msg, now());
  notify('contact', { name, email, topic: str(b.topic, 50), message: msg, lang: langOf(b.lang), created: now() });
  return { ok: true };
});

const STATES = ['Johor','Kedah','Kelantan','Kuala Lumpur','Labuan','Melaka','Negeri Sembilan','Pahang','Perak','Perlis','Pulau Pinang','Putrajaya','Sabah','Sarawak','Selangor','Terengganu'];
route('POST', '/api/callback', async (req, res, b) => {
  limit('cb:' + ipOf(req), 5, 600000);
  const name = str(b.name, 100), phone = str(b.phone, 30).replace(/[^\d+ -]/g, ''), email = str(b.email, 254);
  if (name.length < 2) bad('Please enter your name.');
  if (phone.replace(/\D/g, '').length < 8) bad('Please enter a valid phone number.');
  if (!emailOk(email)) bad('Invalid email address.');
  if (!STATES.includes(b.state)) bad('Please select your state.');
  if (!b.consent) bad('Please accept the data protection notice.');
  await db.run('INSERT INTO callbacks(name,phone,email,state,need,lang,time_pref,created) VALUES(?,?,?,?,?,?,?,?)', name, phone, email, b.state, str(b.need, 60), langOf(b.lang), str(b.time, 30), now());
  notify('callback', { name, phone, email, state: b.state, need: str(b.need, 60), time: str(b.time, 30), lang: langOf(b.lang), created: now() });
  return { ok: true };
});

route('POST', '/api/feedback', async (req, res, b) => {
  limit('fb:' + ipOf(req), 8, 600000);
  const rating = P.clamp(Math.round(P.num(b.rating, 0)), 1, 5);
  await db.run('INSERT INTO feedback(rating,purpose,comment,page,created) VALUES(?,?,?,?,?)', rating, str(b.purpose, 60), str(b.comment, 1000), str(b.page, 100), now());
  notify('feedback', { rating, purpose: str(b.purpose, 60), comment: str(b.comment, 1000), page: str(b.page, 100), created: now() });
  return { ok: true };
});

route('POST', '/api/email-quote', async (req, res, b) => {
  limit('eq:' + ipOf(req), 6, 600000);
  const u = await userFrom(req);
  const email = str(b.email, 254).toLowerCase(); if (!emailOk(email)) bad('Invalid email address.');
  const plan = P.planOf(b.plan);
  let m = metricsOf(b);
  const hist = u ? await userMetrics(u.id, 28) : [];
  if (b.useStored && hist.length >= 7) m = P.averageMetrics(hist);
  const q = P.quote(m, { appSubscription: !!b.appSubscription, plan: plan.id });
  notify('quote', { name: u ? u.name : str(b.name, 100), email, plan: plan.id, base: q.base, score: q.score, grade: q.grade, adjustmentPct: q.adjustmentPct, annualPremium: q.annualPremium, monthlyPremium: q.monthlyPremium, totalAnnual: q.totalAnnual, lang: langOf(b.lang), created: now() });
  return { ok: true, quote: q };
});

route('POST', '/api/waitlist', async (req, res, b) => {
  const email = str(b.email, 254).toLowerCase(); if (!emailOk(email)) bad('Invalid email address.');
  await db.run('INSERT INTO waitlist(email,created) VALUES(?,?) ON CONFLICT (email) DO NOTHING', email, now());
  notify('waitlist', { email, lang: langOf(b.lang), created: now() });
  return { ok: true };
});

// ---- request handler ----
const SEC = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'same-origin' };
let schemaReady = null;
const ensureSchema = () => schemaReady || (schemaReady = db.run(SCHEMA).catch((e) => { schemaReady = null; throw e; }));

async function handleApi(req, res) {
  const url = new URL(req.url, 'http://x');
  try {
    limit('api:' + ipOf(req), 120, 60000);
    const fn = routes[`${req.method} ${url.pathname.replace(/\/+$/, '')}`];
    if (!fn) bad('Not found', 404);
    await ensureSchema();
    const body = req.method === 'POST' ? await readBody(req) : {};
    const tok = tokenOf(req), who = tok ? await userFrom(req) : null;
    const out = await fn(req, res, body);
    if (req.headers['x-client'] === 'pulsecover-app' && res.pcToken && out && typeof out === 'object') out.token = res.pcToken;
    if (who && !res.getHeader('Set-Cookie')) { bg(db.run('UPDATE sessions SET expires=? WHERE token=?', Date.now() + IDLE_MS, tok)); if (!req.headers.authorization) res.setHeader('Set-Cookie', sessionCookie(tok)); }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...SEC, ...(res.getHeader('Set-Cookie') ? { 'Set-Cookie': res.getHeader('Set-Cookie') } : {}) });
    res.end(JSON.stringify(out));
  } catch (e) {
    let code = e instanceof HttpError ? e.code : 500, msg = code === 500 ? 'Server error' : e.message;
    if (e && e.code === 'NO_DB') { code = 503; msg = 'The database is not connected yet. Set DATABASE_URL (Supabase) in the hosting settings.'; }
    if (code >= 500) console.error('[api error]', req.method, url.pathname, e && e.message);
    res.writeHead(code, { 'Content-Type': 'application/json', ...SEC });
    res.end(JSON.stringify({ error: msg }));
  }
}

module.exports = { handleApi, routes };
