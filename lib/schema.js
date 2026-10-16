'use strict';
// Database tables. Safe to run many times. The same SQL is in supabase/schema.sql (paste it in the Supabase SQL Editor if you prefer).
// Row Level Security is switched on with no policies, so the public Supabase API key cannot read these tables.
// The server connects with the database owner role (DATABASE_URL), which is not affected by RLS.
module.exports = `
CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, pass TEXT, salt TEXT, dob TEXT, lang TEXT, refcode TEXT UNIQUE, referred_by INTEGER, created TEXT, phone TEXT, address TEXT);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER, expires BIGINT);
CREATE TABLE IF NOT EXISTS policies(id SERIAL PRIMARY KEY, user_id INTEGER, plan TEXT, number TEXT, status TEXT, device TEXT, cover DOUBLE PRECISION, base DOUBLE PRECISION, premium DOUBLE PRECISION, app_sub INTEGER, guardian TEXT, beneficiary TEXT, start_date TEXT, renewal_date TEXT, paused_until TEXT, pause_reason TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS metrics(id SERIAL PRIMARY KEY, user_id INTEGER, day TEXT, steps DOUBLE PRECISION, exercise_min DOUBLE PRECISION, sleep_hours DOUBLE PRECISION, resting_hr DOUBLE PRECISION, source TEXT, UNIQUE(user_id, day));
CREATE TABLE IF NOT EXISTS claims(id SERIAL PRIMARY KEY, user_id INTEGER, policy_id INTEGER, number TEXT, type TEXT, amount DOUBLE PRECISION, description TEXT, incident_date TEXT, status TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS claim_events(id SERIAL PRIMARY KEY, claim_id INTEGER, status TEXT, note TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS sme(id SERIAL PRIMARY KEY, company TEXT, contact TEXT, email TEXT, phone TEXT, employees INTEGER, message TEXT, quote TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS contact(id SERIAL PRIMARY KEY, name TEXT, email TEXT, topic TEXT, message TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS connections(id SERIAL PRIMARY KEY, user_id INTEGER, provider TEXT, connected_at TEXT, last_sync TEXT, UNIQUE(user_id, provider));
CREATE TABLE IF NOT EXISTS callbacks(id SERIAL PRIMARY KEY, name TEXT, phone TEXT, email TEXT, state TEXT, need TEXT, lang TEXT, time_pref TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS feedback(id SERIAL PRIMARY KEY, rating INTEGER, purpose TEXT, comment TEXT, page TEXT, created TEXT);
CREATE TABLE IF NOT EXISTS waitlist(id SERIAL PRIMARY KEY, email TEXT UNIQUE, created TEXT);
CREATE TABLE IF NOT EXISTS campaign_joins(id SERIAL PRIMARY KEY, user_id INTEGER, campaign_id TEXT, joined TEXT, UNIQUE(user_id, campaign_id));
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_policies_user ON policies(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_user ON metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_user ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claim_events_claim ON claim_events(claim_id);
CREATE INDEX IF NOT EXISTS idx_users_referred ON users(referred_by);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sme ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_joins ENABLE ROW LEVEL SECURITY;
`;
