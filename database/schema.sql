-- ============================================================================
-- StudyNest - Database Schema (SQLite)
-- ============================================================================
-- This file defines the tables used for Login / Register.
-- It is run automatically by database/db.py when the server starts.
-- ============================================================================

-- Registered students
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,          -- PBKDF2-SHA256 hash, never the plain password
  salt          TEXT    NOT NULL,          -- random salt used for hashing
  created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Logged-in sessions (one row per login, removed on logout)
CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT    PRIMARY KEY,          -- random token stored in the browser cookie
  user_id    INTEGER NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  expires_at TEXT    NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
