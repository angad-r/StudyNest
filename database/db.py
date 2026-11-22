"""
============================================================================
StudyNest - Database Module (SQLite)
============================================================================
All database code lives in this one file:
1. Connecting to the SQLite database file (database/study_hub.db)
2. Creating the tables from schema.sql
3. Registering users (with hashed passwords)
4. Checking login details
5. Creating / reading / deleting login sessions

Uses only Python's built-in modules (sqlite3, hashlib, secrets) -
nothing to install.
============================================================================
"""

import hashlib
import os
import secrets
import sqlite3
from datetime import datetime, timedelta

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(DB_DIR, "study_hub.db")
SCHEMA_FILE = os.path.join(DB_DIR, "schema.sql")

SESSION_DAYS = 7          # how long a login stays valid
HASH_ITERATIONS = 200000  # PBKDF2 rounds


def get_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    """Create the database file and tables if they don't exist yet."""
    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        schema = f.read()
    with get_connection() as conn:
        conn.executescript(schema)


# ---------------------------------------------------------------------------
# Password hashing
# ---------------------------------------------------------------------------
def hash_password(password, salt=None):
    if salt is None:
        salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), HASH_ITERATIONS
    )
    return digest.hex(), salt


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------
def create_user(full_name, email, password):
    """Returns the new user's id, or None if the email is already registered."""
    password_hash, salt = hash_password(password)
    try:
        with get_connection() as conn:
            cur = conn.execute(
                "INSERT INTO users (full_name, email, password_hash, salt) VALUES (?, ?, ?, ?)",
                (full_name, email.lower(), password_hash, salt),
            )
            return cur.lastrowid
    except sqlite3.IntegrityError:
        return None


def verify_user(email, password):
    """Returns the user row if the email + password are correct, else None."""
    with get_connection() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email.lower(),)
        ).fetchone()
    if user is None:
        return None
    check_hash, _ = hash_password(password, user["salt"])
    if secrets.compare_digest(check_hash, user["password_hash"]):
        return user
    return None


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------
def create_session(user_id):
    token = secrets.token_urlsafe(32)
    expires = datetime.now() + timedelta(days=SESSION_DAYS)
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)",
            (token, user_id, expires.strftime("%Y-%m-%d %H:%M:%S")),
        )
    return token


def get_user_by_session(token):
    """Returns the logged-in user for a session token, or None."""
    if not token:
        return None
    with get_connection() as conn:
        return conn.execute(
            "SELECT users.id, users.full_name, users.email, users.created_at "
            "FROM sessions JOIN users ON users.id = sessions.user_id "
            "WHERE sessions.token = ? AND sessions.expires_at > datetime('now', 'localtime')",
            (token,),
        ).fetchone()


def delete_session(token):
    with get_connection() as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
