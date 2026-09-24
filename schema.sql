-- Run this once in the D1 database's own "Console" tab in the Cloudflare
-- dashboard, after creating the database and before the form can work.
-- email is UNIQUE so the same person joining twice never creates two rows.
CREATE TABLE IF NOT EXISTS signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
