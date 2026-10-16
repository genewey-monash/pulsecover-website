#!/usr/bin/env node
'use strict';
// Admin helper: set a new password for an account (for demo and test accounts). Passwords are stored only as salted hashes,
// so nobody (including us) can read an existing password; this sets a NEW one that you choose and signs the user out everywhere.
// usage: DATABASE_URL="postgresql://..." node tools/reset-password.js someone@example.com NewPassword123
const crypto = require('node:crypto');
const { Pool } = require('pg');
const [email, pw] = [String(process.argv[2] || '').trim().toLowerCase(), String(process.argv[3] || '')];
if (!email || pw.length < 8 || !process.env.DATABASE_URL) {
  console.error('usage: DATABASE_URL="postgresql://..." node tools/reset-password.js <email> <new password (8+ characters)>'); process.exit(1);
}
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    const salt = crypto.randomBytes(16).toString('hex').toUpperCase();
    const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
    const r = await pool.query('UPDATE users SET pass=$1, salt=$2 WHERE email=$3 RETURNING id', [hash, salt, email]);
    if (!r.rowCount) { console.error('No account with that email.'); process.exitCode = 1; return; }
    await pool.query('DELETE FROM sessions WHERE user_id=$1', [r.rows[0].id]);
    console.log('Password updated for', email, '(signed out everywhere).');
  } finally { await pool.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
