'use strict';
// Postgres access for PulseCover. In production this is the Supabase database (set DATABASE_URL).
// Queries use "?" placeholders; they are converted to $1, $2, ... here so the route code stays readable.
const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (pool) return pool;
  const cs = process.env.DATABASE_URL;
  if (!cs) { const e = new Error('DATABASE_URL is not set'); e.code = 'NO_DB'; throw e; }
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(cs);
  pool = new Pool({ connectionString: cs, ssl: local ? false : { rejectUnauthorized: false }, max: 3, idleTimeoutMillis: 10000, connectionTimeoutMillis: 8000 });
  pool.on('error', (e) => console.error('[db pool]', e.message));
  return pool;
}

const convert = (sql) => { let i = 0; return sql.replace(/\?/g, () => '$' + (++i)); };
const all = async (sql, ...p) => (await getPool().query(convert(sql), p)).rows;
const get = async (sql, ...p) => (await all(sql, ...p))[0];
const run = (sql, ...p) => getPool().query(p.length ? convert(sql) : sql, p.length ? p : undefined);
// Tests can inject any object with query(text, params) -> { rows }.
const setPool = (p) => { pool = p; };

module.exports = { all, get, run, setPool };
