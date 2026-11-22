"""
Prints the contents of the database so you can see registered users.
Run:  python view_database.py
"""

from database import db

db.init_db()
with db.get_connection() as conn:
    users = conn.execute(
        "SELECT id, full_name, email, created_at, substr(password_hash, 1, 16) AS hash_preview FROM users"
    ).fetchall()
    sessions = conn.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]

print(f"Database file: {db.DB_FILE}\n")
print(f"USERS ({len(users)})")
print("-" * 95)
print(f"{'ID':<4}{'Full Name':<22}{'Email':<30}{'Registered':<21}Password hash")
print("-" * 95)
for u in users:
    print(f"{u['id']:<4}{u['full_name'][:21]:<22}{u['email'][:29]:<30}{u['created_at']:<21}{u['hash_preview']}...")
print(f"\nActive sessions: {sessions}")
