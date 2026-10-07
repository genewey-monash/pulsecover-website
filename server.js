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

const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const rid = (n) => crypto.randomBytes(n).toString('hex').toUpperCase();
const hash = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString('hex');
const age = (dob) => { const d = new Date(dob); if (isNaN(d)) return -1; const t = new Date(); let a = t.getFullYear() - d.getFullYear(); const m = t.getMonth() - d.getMonth(); if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--; return a; };
const emailOk = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length < 255;
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
function cookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((x) => x[0])); }
function userFrom(req) {
  const tok = cookies(req).pc_session; if (!tok) return null;
  const s = db.prepare('SELECT * FROM sessions WHERE token=? AND expires>?').get(tok, Date.now());
  return s ? db.prepare('SELECT * FROM users WHERE id=?').get(s.user_id) : null;
}
const needUser = (req) => userFrom(req) || bad('Please log in first.', 401);
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, dob: u.dob, lang: u.lang, refcode: u.refcode });

function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(token, userId, Date.now() + 7 * 864e5);
  res.setHeader('Set-Cookie', `pc_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 86400}`);
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
  limit('auth:' + req.socket.remoteAddress, 10, 600000);
  const name = str(b.name, 100), email = str(b.email, 254).toLowerCase(), pw = typeof b.password === 'string' ? b.password : '';
  if (name.length < 2) bad('Please enter your full name.');
  if (!emailOk(email)) bad('Please enter a valid email.');
  if (pw.length < 8) bad('Password must be at least 8 characters.');
  if (age(b.dob) < 16) bad('You must be at least 16 to register. (Guardian consent applies for ages 16-17 when applying.)');
  if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email)) bad('An account with this email already exists.', 409);
  const salt = rid(16);
  let referred = null;
  if (b.referral) { const r = db.prepare('SELECT id FROM users WHERE refcode=?').get(str(b.referral, 20).toUpperCase()); if (r) referred = r.id; }
  const info = db.prepare('INSERT INTO users(name,email,pass,salt,dob,lang,refcode,referred_by,created) VALUES(?,?,?,?,?,?,?,?,?)')
    .run(name, email, hash(pw, salt), salt, b.dob, ['en', 'zh', 'ms', 'ta'].includes(b.lang) ? b.lang : 'en', 'PC' + rid(3), referred, now());
  startSession(res, Number(info.lastInsertRowid));
  return publicUser(db.prepare('SELECT * FROM users WHERE id=?').get(info.lastInsertRowid));
});

route('POST', '/api/login', (req, res, b) => {
  limit('auth:' + req.socket.remoteAddress, 10, 600000);
  const u = db.prepare('SELECT * FROM users WHERE email=?').get(str(b.email, 254).toLowerCase());
  if (!u || !crypto.timingSafeEqual(Buffer.from(hash(String(b.password || ''), u.salt)), Buffer.from(u.pass))) bad('Incorrect email or password.', 401);
  startSession(res, u.id);
  return publicUser(u);
});

route('POST', '/api/logout', (req, res) => {
  const tok = cookies(req).pc_session; if (tok) db.prepare('DELETE FROM sessions WHERE token=?').run(tok);
  res.setHeader('Set-Cookie', 'pc_session=; HttpOnly; Path=/; Max-Age=0');
  return { ok: true };
});

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
  if (!emailOk(email)) bad('Please enter a valid email.');
  const n = Math.max(1, Math.floor(P.num(b.employees, 1)));
  const q = P.smeQuote(n, b.avgScore);
  db.prepare('INSERT INTO sme(company,contact,email,phone,employees,message,quote,created) VALUES(?,?,?,?,?,?,?,?)')
    .run(company, contact, email, str(b.phone, 30), n, str(b.message, 1000), JSON.stringify(q), now());
  return { ok: true, quote: q };
});

route('POST', '/api/contact', (req, res, b) => {
  limit('contact:' + req.socket.remoteAddress, 5, 600000);
  const name = str(b.name, 100), email = str(b.email, 254), msg = str(b.message, 2000);
  if (name.length < 2 || !emailOk(email) || msg.length < 5) bad('Please fill in your name, a valid email and a message.');
  db.prepare('INSERT INTO contact(name,email,topic,message,created) VALUES(?,?,?,?,?)').run(name, email, str(b.topic, 50), msg, now());
  return { ok: true };
});

const STATES = ['Johor','Kedah','Kelantan','Kuala Lumpur','Labuan','Melaka','Negeri Sembilan','Pahang','Perak','Perlis','Pulau Pinang','Putrajaya','Sabah','Sarawak','Selangor','Terengganu'];
route('POST', '/api/callback', (req, res, b) => {
  limit('cb:' + req.socket.remoteAddress, 5, 600000);
  const name = str(b.name, 100), phone = str(b.phone, 30).replace(/[^\d+ -]/g, ''), email = str(b.email, 254);
  if (name.length < 2) bad('Please enter your name.');
  if (phone.replace(/\D/g, '').length < 8) bad('Please enter a valid phone number.');
  if (email && !emailOk(email)) bad('Please enter a valid email.');
  if (!STATES.includes(b.state)) bad('Please select your state.');
  if (!b.consent) bad('Please accept the data protection notice.');
  db.prepare('INSERT INTO callbacks(name,phone,email,state,need,lang,time_pref,created) VALUES(?,?,?,?,?,?,?,?)')
    .run(name, phone, email, b.state, str(b.need, 60), ['en','zh','ms','ta'].includes(b.lang) ? b.lang : 'en', str(b.time, 30), now());
  return { ok: true };
});

route('POST', '/api/feedback', (req, res, b) => {
  limit('fb:' + req.socket.remoteAddress, 8, 600000);
  const rating = P.clamp(Math.round(P.num(b.rating, 0)), 1, 5);
  db.prepare('INSERT INTO feedback(rating,purpose,comment,page,created) VALUES(?,?,?,?,?)').run(rating, str(b.purpose, 60), str(b.comment, 1000), str(b.page, 100), now());
  return { ok: true };
});

route('POST', '/api/waitlist', (req, res, b) => {
  const email = str(b.email, 254).toLowerCase(); if (!emailOk(email)) bad('Please enter a valid email.');
  db.prepare('INSERT OR IGNORE INTO waitlist(email,created) VALUES(?,?)').run(email, now());
  return { ok: true };
});

// ---- static files ----
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
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
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', ...SEC });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) {
    try {
      limit('api:' + req.socket.remoteAddress, 120, 60000);
      const fn = routes[`${req.method} ${url.pathname}`];
      if (!fn) bad('Not found', 404);
      const body = req.method === 'POST' ? await readBody(req) : {};
      const out = fn(req, res, body);
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

server.listen(PORT, () => console.log(`PulseCover running at http://localhost:${PORT}`));
