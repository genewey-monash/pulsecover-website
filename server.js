'use strict';
// PulseCover backend: zero-dependency Node server (http + node:sqlite). Group 5, BFM3130.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const P = require('./pricing');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
const db = new DatabaseSync(path.join(__dirname, 'data', 'pulsecover.db'));
db.exec(`
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, pass TEXT, salt TEXT, dob TEXT, lang TEXT, refcode TEXT UNIQUE, referred_by INTEGER, created TEXT);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER, expires INTEGER);
CREATE TABLE IF NOT EXISTS policies(id INTEGER PRIMARY KEY, user_id INTEGER, plan TEXT, number TEXT, status TEXT, device TEXT, cover REAL, base REAL, premium REAL, app_sub INTEGER, guardian TEXT, beneficiary TEXT, start_date TEXT, renewal_date TEXT, paused_until TEXT, pause_reason TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS metrics(id INTEGER PRIMARY KEY, user_id INTEGER, day TEXT, steps REAL, exercise_min REAL, sleep_hours REAL, resting_hr REAL, source TEXT, UNIQUE(user_id, day));
CREATE TABLE IF NOT EXISTS claims(id INTEGER PRIMARY KEY, user_id INTEGER, policy_id INTEGER, number TEXT, type TEXT, amount REAL, description TEXT, incident_date TEXT, status TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS claim_events(id INTEGER PRIMARY KEY, claim_id INTEGER, status TEXT, note TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS sme(id INTEGER PRIMARY KEY, company TEXT, contact TEXT, email TEXT, phone TEXT, employees INTEGER, message TEXT, quote TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS contact(id INTEGER PRIMARY KEY, name TEXT, email TEXT, topic TEXT, message TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS connections(id INTEGER PRIMARY KEY, user_id INTEGER, provider TEXT, connected_at TEXT, last_sync TEXT, UNIQUE(user_id, provider));
CREATE TABLE IF NOT EXISTS callbacks(id INTEGER PRIMARY KEY, name TEXT, phone TEXT, email TEXT, state TEXT, need TEXT, lang TEXT, time_pref TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS feedback(id INTEGER PRIMARY KEY, rating INTEGER, purpose TEXT, comment TEXT, page TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS waitlist(id INTEGER PRIMARY KEY, email TEXT UNIQUE, created TEXT);
`);
for (const col of ['phone', 'address']) { try { db.exec(`ALTER TABLE users ADD COLUMN ${col} TEXT`); } catch { /* column already exists */ } }

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

// Google Sheets + email via a Google Apps Script web app (see google-apps-script/). Passwords are NEVER sent.
const HOOK = process.env.SHEET_WEBHOOK_URL || '', HOOK_SECRET = process.env.SHEET_SECRET || '';
function notify(action, data) {
  if (!HOOK) { console.log('[sheet-webhook not configured]', action); return; }
  fetch(HOOK, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ secret: HOOK_SECRET, action, data }), redirect: 'follow', signal: AbortSignal.timeout(25000) })
    .then((r) => r.text()).then((t) => console.log('[sheet-webhook]', action, t.slice(0, 120))).catch((e) => console.error('[sheet-webhook failed]', action, e.message));
}
// ---- persistence ----
// Render's free disk is wiped whenever the server sleeps or redeploys. Account data is therefore mirrored to the owner's private
// Google Sheet (hidden tab "_Backup") a few seconds after every change, and restored at start-up before the site accepts traffic.
const BACKUP_TABLES = ['users', 'policies', 'metrics', 'claims', 'claim_events', 'connections'];
let backupTimer = null, restoreOk = !HOOK; // never back up while a restore is still pending, or an empty database could overwrite the saved copy
const callHook = (action, data, ms = 30000) => fetch(HOOK, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ secret: HOOK_SECRET, action, data }), redirect: 'follow', signal: AbortSignal.timeout(ms) }).then((r) => r.json());
function scheduleBackup() { if (!HOOK || !restoreOk) return; clearTimeout(backupTimer); backupTimer = setTimeout(doBackup, 4000); }
async function doBackup() {
  const snap = {}; for (const t of BACKUP_TABLES) snap[t] = db.prepare(`SELECT * FROM ${t}`).all();
  const j = JSON.stringify(snap), chunks = []; for (let i = 0; i < j.length; i += 40000) chunks.push('J' + j.slice(i, i + 40000));
  try { const r = await callHook('backup', { chunks, users: snap.users.length }); if (!r.ok) throw new Error(JSON.stringify(r).slice(0, 100)); console.log('[backup] ok, users:', snap.users.length); }
  catch (e) { console.error('[backup failed]', e.message); backupTimer = setTimeout(doBackup, 30000); }
}
async function restoreFromSheet() {
  if (!HOOK) return true;
  try {
    const r = await callHook('restore', {}, 25000); if (!r.ok) throw new Error('restore refused');
    if (!r.chunks || !r.chunks.length) { console.log('[restore] nothing saved yet'); return true; }
    const snap = JSON.parse(r.chunks.map((c) => String(c).slice(1)).join('')); let n = 0;
    db.exec('BEGIN');
    for (const t of BACKUP_TABLES) for (const row of snap[t] || []) { const cols = Object.keys(row); db.prepare(`INSERT OR IGNORE INTO ${t}(${cols.join(',')}) VALUES(${cols.map(() => '?').join(',')})`).run(...cols.map((c) => row[c])); if (t === 'users') n++; }
    db.exec('COMMIT'); console.log('[restore] users restored:', n); return true;
  } catch (e) { try { db.exec('ROLLBACK'); } catch { /* no open transaction */ } console.error('[restore failed]', e.message); return false; }
}
async function startRestore() {
  for (let i = 0; i < 4 && !restoreOk; i++) { restoreOk = await restoreFromSheet(); if (!restoreOk) await new Promise((r) => setTimeout(r, 3000)); }
  if (!restoreOk) { // keep trying in the background; backups stay paused until it works
    const iv = setInterval(async () => { if (await restoreFromSheet()) { restoreOk = true; clearInterval(iv); scheduleBackup(); } }, 20000);
  }
}

const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

class HttpError extends Error { constructor(code, msg) { super(msg); this.code = code; } }
const bad = (msg, code = 400) => { throw new HttpError(code, msg); };

// naive in-memory rate limit per IP (60 API req / minute, 10 auth attempts / 10 min)
const hits = new Map();
function limit(key, max, windowMs) {
  const t = Date.now(); const arr = (hits.get(key) || []).filter((x) => t - x < windowMs);
  arr.push(t); hits.set(key, arr);
  if (arr.length > max) bad('Too many requests, please slow down.', 429);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > 100_000) { reject(new HttpError(413, 'Payload too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { if (!chunks.length) return resolve({}); try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch { reject(new HttpError(400, 'Invalid JSON')); } });
  });
}
const ipOf = (req) => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;
function cookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((x) => x[0])); }
function userFrom(req) {
  const tok = cookies(req).pc_session; if (!tok) return null;
  const s = db.prepare('SELECT * FROM sessions WHERE token=? AND expires>?').get(tok, Date.now());
  return s ? db.prepare('SELECT * FROM users WHERE id=?').get(s.user_id) : null;
}
const IDLE_MS = 30 * 60 * 1000; // logged out after 30 minutes without activity; renewed on every API call
const sessionCookie = (token) => `pc_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${IDLE_MS / 1000}${process.env.RENDER ? '; Secure' : ''}`;
const needUser = (req) => userFrom(req) || bad('Please log in first.', 401);
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, dob: u.dob, lang: u.lang, refcode: u.refcode, phone: u.phone || '', address: u.address || '' });

function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(token, userId, Date.now() + IDLE_MS);
  res.setHeader('Set-Cookie', sessionCookie(token));
}

function metricsOf(m) {
  return {
    steps: P.clamp(P.num(m.steps, 0), 0, 100000), exerciseMin: P.clamp(P.num(m.exerciseMin, 0), 0, 3000),
    sleepHours: P.clamp(P.num(m.sleepHours, 0), 0, 24), restingHr: P.clamp(P.num(m.restingHr, 70), 30, 200)
  };
}
function userMetrics(uid, days = 365) {
  return db.prepare('SELECT day, steps, exercise_min AS exerciseMin, sleep_hours AS sleepHours, resting_hr AS restingHr, source FROM metrics WHERE user_id=? ORDER BY day DESC LIMIT ?').all(uid, days);
}

// ---- API routes ----
const routes = {};
const route = (method, p, fn) => { routes[`${method} ${p}`] = fn; };

route('POST', '/api/register', (req, res, b) => {
  limit('auth:' + ipOf(req), 10, 600000);
  const name = str(b.name, 100), email = str(b.email, 254).toLowerCase(), pw = typeof b.password === 'string' ? b.password : '';
  if (name.length < 2) bad('Please enter your full name.');
  if (!emailOk(email)) bad('Invalid email address.');
  if (pw.length < 8) bad('Password must be at least 8 characters.');
  if (typeof b.password2 !== 'string' || b.password2 !== pw) bad('The passwords do not match. Please enter them again.');
  if (age(b.dob) < 16) bad('You must be at least 16 to register. (Guardian consent applies for ages 16-17 when applying.)');
  if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email)) bad('An account with this email already exists.', 409);
  const salt = rid(16);
  let referred = null;
  if (b.referral) { const r = db.prepare('SELECT id FROM users WHERE refcode=?').get(str(b.referral, 20).toUpperCase()); if (r) referred = r.id; }
  const info = db.prepare('INSERT INTO users(name,email,pass,salt,dob,lang,refcode,referred_by,created) VALUES(?,?,?,?,?,?,?,?,?)')
    .run(name, email, hash(pw, salt), salt, b.dob, ['en', 'zh', 'ms', 'ta'].includes(b.lang) ? b.lang : 'en', 'PC' + rid(3), referred, now());
  startSession(res, Number(info.lastInsertRowid));
  const created = db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid);
  notify('register', { name, email, lang: created.lang, refcode: created.refcode, created: created.created });
  return publicUser(created);
});

route('POST', '/api/login', (req, res, b) => {
  limit('auth:' + ipOf(req), 10, 600000);
  const loginEmail = str(b.email, 254).toLowerCase();
  if (!emailOk(loginEmail)) bad('Invalid email address.');
  const u = db.prepare('SELECT * FROM users WHERE email=?').get(loginEmail);
  if (!u) bad('No account found with this email. Please register first.', 401);
  if (!crypto.timingSafeEqual(Buffer.from(hash(String(b.password || ''), u.salt)), Buffer.from(u.pass))) bad('Incorrect email or password.', 401);
  startSession(res, u.id);
  return publicUser(u);
});

route('POST', '/api/logout', (req, res) => {
  const tok = cookies(req).pc_session; if (tok) db.prepare('DELETE FROM sessions WHERE token=?').run(tok);
  res.setHeader('Set-Cookie', 'pc_session=; HttpOnly; Path=/; Max-Age=0');
  return { ok: true };
});


route('POST', '/api/profile', (req, res, b) => {
  const u = needUser(req);
  const name = str(b.name, 100), phone = str(b.phone, 20), address = str(b.address, 200), dob = typeof b.dob === 'string' ? b.dob : u.dob;
  const lang = ['en', 'zh', 'ms', 'ta'].includes(b.lang) ? b.lang : u.lang;
  if (name.length < 2) bad('Please enter your full name.');
  if (phone && !/^\+?[0-9][0-9 \-]{6,18}$/.test(phone)) bad('Invalid phone number.');
  if (age(dob) < 16) bad('You must be at least 16 to register. (Guardian consent applies for ages 16-17 when applying.)');
  db.prepare('UPDATE users SET name=?, phone=?, address=?, dob=?, lang=? WHERE id=?').run(name, phone, address, dob, lang, u.id);
  return publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(u.id));
});

route('POST', '/api/password', (req, res, b) => {
  limit('auth:' + ipOf(req), 10, 600000);
  const u = needUser(req);
  const cur = String(b.current || ''), pw = typeof b.password === 'string' ? b.password : '';
  if (!crypto.timingSafeEqual(Buffer.from(hash(cur, u.salt)), Buffer.from(u.pass))) bad('Incorrect email or password.', 401);
  if (pw.length < 8) bad('Password must be at least 8 characters.');
  if (b.password2 !== pw) bad('The passwords do not match. Please enter them again.');
  const salt = rid(16);
  db.prepare('UPDATE users SET pass=?, salt=? WHERE id=?').run(hash(pw, salt), salt, u.id);
  const tok = cookies(req).pc_session;
  db.prepare('DELETE FROM sessions WHERE user_id=? AND token<>?').run(u.id, tok || '');
  return { ok: true };
});

route('POST', '/api/policy', (req, res, b) => {
  const u = needUser(req);
  const pol = policyOf(u.id); if (!pol) bad('You do not have a policy yet.', 404);
  let plan = pol.plan, beneficiary = pol.beneficiary, guardian = pol.guardian, appSub = pol.app_sub;
  if (b.plan !== undefined) { if (!P.PLANS[b.plan]) bad('Choose a plan.'); plan = b.plan; }
  if (b.beneficiary !== undefined) { beneficiary = str(b.beneficiary, 100); if (beneficiary.length < 2) bad('Please add a beneficiary.'); }
  if (b.appSubscription !== undefined) appSub = b.appSubscription ? 1 : 0;
  const hist = userMetrics(u.id, 28);
  const mm = hist.length >= 7 ? P.averageMetrics(hist) : { steps: 7500, exerciseMin: 100, sleepHours: 7.5, restingHr: 66 };
  const q = P.quote(mm, { appSubscription: !!appSub, plan });
  const pl = P.planOf(plan);
  db.prepare('UPDATE policies SET plan=?, cover=?, base=?, premium=?, app_sub=?, beneficiary=?, guardian=? WHERE id=?').run(plan, pl.cover, q.base, q.annualPremium, appSub, beneficiary, guardian, pol.id);
  return { policy: policyOf(u.id) };
});

route('POST', '/api/policy/preview', (req, res, b) => {
  const u = needUser(req);
  const pol = policyOf(u.id);
  const hist = userMetrics(u.id, 28);
  const mm = hist.length >= 7 ? P.averageMetrics(hist) : { steps: 7500, exerciseMin: 100, sleepHours: 7.5, restingHr: 66 };
  return Object.values(P.PLANS).map((pl) => ({ id: pl.id, cover: pl.cover, base: pl.base, premium: P.quote(mm, { appSubscription: !!(pol && pol.app_sub), plan: pl.id }).annualPremium }));
});

route('GET', '/api/health', () => ({ ok: true, uptimeSeconds: Math.round(process.uptime()), accounts: db.prepare('SELECT COUNT(*) c FROM users').get().c, backupEnabled: !!HOOK, restored: restoreOk }));

route('GET', '/api/me', (req) => { const u = userFrom(req); return { user: u ? publicUser(u) : null }; });

route('POST', '/api/lang', (req, res, b) => {
  const u = userFrom(req); if (u && ['en', 'zh', 'ms', 'ta'].includes(b.lang)) db.prepare('UPDATE users SET lang=? WHERE id=?').run(b.lang, u.id);
  return { ok: true };
});

route('GET', '/api/plans', () => Object.values(P.PLANS));

route('POST', '/api/quote', (req, res, b) => P.quote(metricsOf(b), { appSubscription: !!b.appSubscription, plan: b.plan }));

route('POST', '/api/sme/quote', (req, res, b) => P.smeQuote(b.employees, b.avgScore));

route('GET', '/api/financials', () => P.financials());

route('POST', '/api/apply', (req, res, b) => {
  const u = needUser(req);
  if (db.prepare("SELECT 1 FROM policies WHERE user_id=? AND status IN ('active','pending')").get(u.id)) bad('You already have a policy.', 409);
  const a = age(u.dob);
  const guardian = str(b.guardian, 100);
  if (a < 18 && guardian.length < 2) bad('A parent or guardian name is required for applicants under 18.');
  if (!b.consentData || !b.consentTerms) bad('You must accept the data consent and the pricing terms.');
  if (!['fitbit', 'garmin', 'whoop', 'healthconnect', 'manual'].includes(b.device)) bad('Choose a wearable device.');
  const plan = P.planOf(b.plan);
  const cover = plan.cover;
  const beneficiary = str(b.beneficiary, 100);
  if (beneficiary.length < 2) bad('Please add a beneficiary.');
  const hist28 = userMetrics(u.id, 28);
  const mm = hist28.length >= 7 ? P.averageMetrics(hist28) : metricsOf(b);
  const q = P.quote(mm, { appSubscription: !!b.appSubscription, plan: plan.id });
  const number = 'PC-' + new Date().getFullYear() + '-' + rid(3);
  // First year: indicative premium from the quote metrics; repricing at renewal from 12-month average.
  db.prepare('INSERT INTO policies(user_id,plan,number,status,device,cover,base,premium,app_sub,guardian,beneficiary,start_date,renewal_date,created) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .run(u.id, plan.id, number, 'active', b.device, cover, q.base, q.annualPremium, b.appSubscription ? 1 : 0, guardian, beneficiary, today(), addDays(today(), 365), now());
  if (!hist28.length) db.prepare('INSERT OR REPLACE INTO metrics(user_id,day,steps,exercise_min,sleep_hours,resting_hr,source) VALUES(?,?,?,?,?,?,?)')
    .run(u.id, today(), metricsOf(b).steps, metricsOf(b).exerciseMin / 7, metricsOf(b).sleepHours, metricsOf(b).restingHr, b.device);
  notify('application', { name: u.name, email: u.email, number, plan: plan.id, cover, premium: q.annualPremium, grade: q.grade, score: q.score, device: b.device, beneficiary, guardian, lang: langOf(b.lang || u.lang), created: now() });
  return { number, quote: q };
});

function policyOf(uid) { return db.prepare("SELECT * FROM policies WHERE user_id=? AND status='active' ORDER BY id DESC").get(uid); }

route('GET', '/api/dashboard', (req) => {
  const u = needUser(req);
  const pol = policyOf(u.id);
  const ms = userMetrics(u.id, 90);
  const avg = P.averageMetrics(ms.slice(0, 30));
  const current = P.quote(avg, { appSubscription: pol ? !!pol.app_sub : false, plan: pol && pol.plan });
  const claims = db.prepare('SELECT * FROM claims WHERE user_id=? ORDER BY id DESC').all(u.id);
  const referrals = db.prepare('SELECT COUNT(*) c FROM users WHERE referred_by=?').get(u.id).c;
  const ranking = db.prepare('SELECT u.name, COUNT(r.id) c FROM users u JOIN users r ON r.referred_by=u.id GROUP BY u.id ORDER BY c DESC LIMIT 5').all()
    .map((r) => ({ name: r.name.split(' ')[0] + ' ' + (r.name.split(' ')[1] ? r.name.split(' ')[1][0] + '.' : ''), count: r.c }));
  const paused = pol && pol.paused_until && pol.paused_until >= today() ? pol.paused_until : null;
  const withScore = ms.map((m) => ({ ...m, score: P.score(m).score })).reverse();
  const weekly = weeklySummary(u.id);
  const connections = db.prepare('SELECT provider, connected_at, last_sync FROM connections WHERE user_id=?').all(u.id);
  return { user: publicUser(u), policy: pol || null, metrics: withScore, projected: current, score30: ms.length ? P.score(avg).score : null, grade: ms.length ? P.gradeOf(P.score(avg).score) : null, weekly, connections, paused, claims, referrals, ranking };
});

const PROVIDERS = ['healthconnect', 'fitbit', 'garmin', 'whoop'];
// Real Fitbit/Garmin/Whoop/Google Health Connect OAuth needs vendor partner credentials. This stores the consent and backfills
// 28 days of simulated readings through the same pipeline a real connector would feed.
function backfill(uid, provider) {
  const have = db.prepare('SELECT COUNT(*) c FROM metrics WHERE user_id=?').get(uid).c;
  if (have >= 14) return 0;
  const seed = crypto.createHash('sha256').update('profile' + uid).digest();
  const base = { steps: 5500 + (seed[0] / 255) * 5500, ex: 60 + (seed[1] / 255) * 110, sl: 6.2 + (seed[2] / 255) * 2, hr: 54 + (seed[3] / 255) * 18 };
  const ins = db.prepare('INSERT OR IGNORE INTO metrics(user_id,day,steps,exercise_min,sleep_hours,resting_hr,source) VALUES(?,?,?,?,?,?,?)');
  let n = 0;
  for (let i = 27; i >= 0; i--) {
    const day = addDays(today(), -i);
    const r = crypto.createHash('sha256').update(uid + day).digest();
    const wk = new Date(day).getDay() % 6 === 0 ? 0.85 : 1.05;
    ins.run(uid, day, Math.round(base.steps * wk * (0.75 + (r[0] / 255) * 0.5)), Math.round((base.ex / 7) * wk * (0.6 + (r[1] / 255) * 0.9)),
      Math.round((base.sl + (r[2] / 255 - 0.5)) * 10) / 10, Math.round(base.hr + (r[3] / 255 - 0.5) * 6), provider + '-sync');
    n++;
  }
  return n;
}
function weeklySummary(uid) {
  const rows = userMetrics(uid, 70).reverse();
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

route('POST', '/api/connect', (req, res, b) => {
  const u = needUser(req);
  const provider = PROVIDERS.includes(b.provider) ? b.provider : bad('Choose a wearable to connect.');
  if (!b.consent) bad('Please approve the data permissions to connect.');
  db.prepare('INSERT OR REPLACE INTO connections(user_id,provider,connected_at,last_sync) VALUES(?,?,?,?)').run(u.id, provider, now(), now());
  const added = backfill(u.id, provider);
  const hist = userMetrics(u.id, 28);
  const q = P.quote(P.averageMetrics(hist), { plan: b.plan });
  return { provider, days: hist.length, added, quote: q };
});

route('POST', '/api/disconnect', (req, res, b) => {
  const u = needUser(req);
  db.prepare('DELETE FROM connections WHERE user_id=? AND provider=?').run(u.id, String(b.provider || ''));
  return { ok: true };
});

route('POST', '/api/my-quote', (req, res, b) => {
  const u = needUser(req);
  const hist = userMetrics(u.id, 28);
  if (hist.length < 7) bad('Connect a wearable first so we can build your rating.');
  return { days: hist.length, quote: P.quote(P.averageMetrics(hist), { plan: b.plan, appSubscription: !!b.appSubscription }) };
});

// Wearable sync. Real Fitbit/Garmin/Whoop OAuth needs vendor partner credentials, so this ingests either manual entries
// or a simulated device reading and stores it via the same pipeline a real connector would use.
route('POST', '/api/sync', (req, res, b) => {
  const u = needUser(req);
  const pol = policyOf(u.id); if (!pol) bad('Apply for a policy first.');
  if (pol.paused_until && pol.paused_until >= today()) bad('Tracking is paused until ' + pol.paused_until + '. These days are excluded from your average.');
  let m;
  if (b.manual) m = metricsOf(b);
  else { // simulated reading, seeded by date + user for plausible, stable values
    const seed = crypto.createHash('sha256').update(u.id + today() + Date.now()).digest();
    const r = (i) => seed[i] / 255;
    m = { steps: Math.round(4500 + r(0) * 8000), exerciseMin: Math.round(10 + r(1) * 60), sleepHours: Math.round((5.8 + r(2) * 3) * 10) / 10, restingHr: Math.round(54 + r(3) * 20) };
  }
  db.prepare('INSERT OR REPLACE INTO metrics(user_id,day,steps,exercise_min,sleep_hours,resting_hr,source) VALUES(?,?,?,?,?,?,?)')
    .run(u.id, today(), m.steps, m.exerciseMin, m.sleepHours, m.restingHr, b.manual ? 'manual' : pol.device + '-sync');
  return { day: today(), ...m };
});

route('POST', '/api/pause', (req, res, b) => {
  const u = needUser(req); const pol = policyOf(u.id) || bad('No active policy.');
  const days = P.clamp(Math.floor(P.num(b.days, 14)), 1, 60);
  const reason = ['illness', 'injury', 'travel', 'pregnancy', 'other'].includes(b.reason) ? b.reason : 'other';
  db.prepare('UPDATE policies SET paused_until=?, pause_reason=? WHERE id=?').run(addDays(today(), days), reason, pol.id);
  return { pausedUntil: addDays(today(), days), reason };
});

route('POST', '/api/claims', (req, res, b) => {
  const u = needUser(req); const pol = policyOf(u.id) || bad('You need an active policy to claim.');
  const type = ['hospitalisation', 'outpatient', 'critical_illness', 'accident', 'death'].includes(b.type) ? b.type : bad('Choose a claim type.');
  const amount = P.num(b.amount, 0); if (amount <= 0 || amount > pol.cover) bad('Enter a valid claim amount within your cover.');
  const description = str(b.description, 2000); if (description.length < 10) bad('Please describe what happened (at least 10 characters).');
  const incident = str(b.incidentDate, 10); if (!/^\d{4}-\d{2}-\d{2}$/.test(incident) || incident > today()) bad('Enter a valid incident date.');
  const number = 'CL-' + rid(3);
  const info = db.prepare('INSERT INTO claims(user_id,policy_id,number,type,amount,description,incident_date,status,created) VALUES(?,?,?,?,?,?,?,?,?)')
    .run(u.id, pol.id, number, type, amount, description, incident, 'received', now());
  db.prepare('INSERT INTO claim_events(claim_id,status,note,created) VALUES(?,?,?,?)').run(info.lastInsertRowid, 'received', 'Claim received', now());
  notify('claim', { name: u.name, email: u.email, number, type, amount, incident, description, lang: langOf(b.lang || u.lang), created: now() });
  return { number };
});

route('GET', '/api/claims', (req) => {
  const u = needUser(req);
  const claims = db.prepare('SELECT * FROM claims WHERE user_id=? ORDER BY id DESC').all(u.id);
  return claims.map((c) => ({ ...c, events: db.prepare('SELECT status,note,created FROM claim_events WHERE claim_id=? ORDER BY id').all(c.id) }));
});

route('POST', '/api/sme/enquiry', (req, res, b) => {
  const company = str(b.company, 150), contact = str(b.contact, 100), email = str(b.email, 254);
  if (company.length < 2 || contact.length < 2) bad('Company and contact name are required.');
  if (!emailOk(email)) bad('Invalid email address.');
  const n = Math.max(1, Math.floor(P.num(b.employees, 1)));
  const q = P.smeQuote(n, b.avgScore);
  db.prepare('INSERT INTO sme(company,contact,email,phone,employees,message,quote,created) VALUES(?,?,?,?,?,?,?,?)')
    .run(company, contact, email, str(b.phone, 30), n, str(b.message, 1000), JSON.stringify(q), now());
  notify('sme', { company, contact, email, phone: str(b.phone, 30), employees: n, message: str(b.message, 1000), quote: q, lang: langOf(b.lang) });
  return { ok: true, quote: q };
});

route('POST', '/api/contact', (req, res, b) => {
  limit('contact:' + ipOf(req), 5, 600000);
  const name = str(b.name, 100), email = str(b.email, 254), msg = str(b.message, 2000);
  if (name.length < 2) bad('Please enter your name.');
  if (!emailOk(email)) bad('Invalid email address.');
  if (msg.length < 5) bad('Please write your message.');
  db.prepare('INSERT INTO contact(name,email,topic,message,created) VALUES(?,?,?,?,?)').run(name, email, str(b.topic, 50), msg, now());
  notify('contact', { name, email, topic: str(b.topic, 50), message: msg, lang: langOf(b.lang), created: now() });
  return { ok: true };
});

const STATES = ['Johor','Kedah','Kelantan','Kuala Lumpur','Labuan','Melaka','Negeri Sembilan','Pahang','Perak','Perlis','Pulau Pinang','Putrajaya','Sabah','Sarawak','Selangor','Terengganu'];
route('POST', '/api/callback', (req, res, b) => {
  limit('cb:' + ipOf(req), 5, 600000);
  const name = str(b.name, 100), phone = str(b.phone, 30).replace(/[^\d+ -]/g, ''), email = str(b.email, 254);
  if (name.length < 2) bad('Please enter your name.');
  if (phone.replace(/\D/g, '').length < 8) bad('Please enter a valid phone number.');
  if (!emailOk(email)) bad('Invalid email address.');
  if (!STATES.includes(b.state)) bad('Please select your state.');
  if (!b.consent) bad('Please accept the data protection notice.');
  db.prepare('INSERT INTO callbacks(name,phone,email,state,need,lang,time_pref,created) VALUES(?,?,?,?,?,?,?,?)')
    .run(name, phone, email, b.state, str(b.need, 60), langOf(b.lang), str(b.time, 30), now());
  notify('callback', { name, phone, email, state: b.state, need: str(b.need, 60), time: str(b.time, 30), lang: langOf(b.lang), created: now() });
  return { ok: true };
});

route('POST', '/api/feedback', (req, res, b) => {
  limit('fb:' + ipOf(req), 8, 600000);
  const rating = P.clamp(Math.round(P.num(b.rating, 0)), 1, 5);
  db.prepare('INSERT INTO feedback(rating,purpose,comment,page,created) VALUES(?,?,?,?,?)').run(rating, str(b.purpose, 60), str(b.comment, 1000), str(b.page, 100), now());
  notify('feedback', { rating, purpose: str(b.purpose, 60), comment: str(b.comment, 1000), page: str(b.page, 100), created: now() });
  return { ok: true };
});

route('POST', '/api/email-quote', (req, res, b) => {
  limit('eq:' + ipOf(req), 6, 600000);
  const u = userFrom(req);
  const email = str(b.email, 254).toLowerCase(); if (!emailOk(email)) bad('Invalid email address.');
  const plan = P.planOf(b.plan);
  let m = metricsOf(b);
  const hist = u ? userMetrics(u.id, 28) : [];
  if (b.useStored && hist.length >= 7) m = P.averageMetrics(hist);
  const q = P.quote(m, { appSubscription: !!b.appSubscription, plan: plan.id });
  notify('quote', { name: u ? u.name : str(b.name, 100), email, plan: plan.id, base: q.base, score: q.score, grade: q.grade, adjustmentPct: q.adjustmentPct, annualPremium: q.annualPremium, monthlyPremium: q.monthlyPremium, totalAnnual: q.totalAnnual, lang: langOf(b.lang), created: now() });
  return { ok: true, quote: q };
});

route('POST', '/api/waitlist', (req, res, b) => {
  const email = str(b.email, 254).toLowerCase(); if (!emailOk(email)) bad('Invalid email address.');
  db.prepare('INSERT OR IGNORE INTO waitlist(email,created) VALUES(?,?)').run(email, now());
  notify('waitlist', { email, lang: langOf(b.lang), created: now() });
  return { ok: true };
});

// ---- static files ----
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.webp': 'image/webp', '.jpeg': 'image/jpeg' };
const SEC = { 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'SAMEORIGIN', 'Referrer-Policy': 'same-origin' };

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname); if (rel.endsWith('/')) rel += 'index.html';
  let file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end('Forbidden'); }
  if (!path.extname(file) && !fs.existsSync(file)) file += '.html';
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', ...SEC });
      return fs.readFile(path.join(PUBLIC, '404.html'), (e, d) => res.end(e ? 'Not found' : d));
    }
    const type = MIME[path.extname(file)] || 'application/octet-stream';
    const cache = rel.startsWith('/img/') ? { 'Cache-Control': 'public, max-age=86400' } : {};
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (range && type.startsWith('video/')) { // byte-range support so video plays in Safari
      const start = range[1] ? parseInt(range[1], 10) : 0;
      const end = range[2] ? Math.min(parseInt(range[2], 10), data.length - 1) : data.length - 1;
      if (start > end || start >= data.length) { res.writeHead(416, { 'Content-Range': `bytes */${data.length}` }); return res.end(); }
      res.writeHead(206, { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${data.length}`, 'Content-Length': end - start + 1, ...cache, ...SEC });
      return res.end(data.subarray(start, end + 1));
    }
    res.writeHead(200, { 'Content-Type': type, 'Accept-Ranges': 'bytes', ...cache, ...SEC });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) {
    try {
      limit('api:' + ipOf(req), 120, 60000);
      const fn = routes[`${req.method} ${url.pathname}`];
      if (!fn) bad('Not found', 404);
      const body = req.method === 'POST' ? await readBody(req) : {};
      const tok = cookies(req).pc_session, who = tok ? userFrom(req) : null;
      const out = fn(req, res, body);
      if (req.method === 'POST' && /^\/api\/(register|profile|password|policy|apply|connect|disconnect|my-quote|sync|pause|claims)$/.test(url.pathname)) scheduleBackup();
      if (who && !res.getHeader('Set-Cookie')) { db.prepare('UPDATE sessions SET expires=? WHERE token=?').run(Date.now() + IDLE_MS, tok); res.setHeader('Set-Cookie', sessionCookie(tok)); }
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...SEC, ...(res.getHeader('Set-Cookie') ? { 'Set-Cookie': res.getHeader('Set-Cookie') } : {}) });
      res.end(JSON.stringify(out));
    } catch (e) {
      const code = e instanceof HttpError ? e.code : 500;
      if (code === 500) console.error(e);
      res.writeHead(code, { 'Content-Type': 'application/json', ...SEC });
      res.end(JSON.stringify({ error: code === 500 ? 'Server error' : e.message }));
    }
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  serveStatic(req, res, url.pathname);
});

startRestore().finally(() => server.listen(PORT, () => console.log(`PulseCover running at http://localhost:${PORT}`)));
