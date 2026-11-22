"""
============================================================================
StudyNest - Web Server
============================================================================
Run:   python server.py      (or python3 server.py)
Open:  http://localhost:8000

Serves the HTML/CSS/JS files and adds a small login API:
  POST /api/register   { full_name, email, password }
  POST /api/login      { email, password }
  POST /api/logout
  GET  /api/me         -> the logged-in user (or 401)

Uses only Python's standard library - nothing to install.
============================================================================
"""

import json
import os
import re
from http import cookies
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from database import db

PORT = int(os.environ.get("PORT", 8000))
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_NAME = "hub_session"
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class HubHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)

    # ----- helpers ---------------------------------------------------------
    def send_json(self, status, data, extra_headers=None):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        for name, value in (extra_headers or []):
            self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        if length <= 0 or length > 10000:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            return {}

    def get_session_token(self):
        jar = cookies.SimpleCookie(self.headers.get("Cookie", ""))
        return jar[COOKIE_NAME].value if COOKIE_NAME in jar else None

    def session_cookie(self, token, max_age):
        return (
            "Set-Cookie",
            f"{COOKIE_NAME}={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={max_age}",
        )

    @staticmethod
    def user_json(user):
        return {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "created_at": user["created_at"],
        }

    # ----- routes ----------------------------------------------------------
    def do_GET(self):
        path = self.path.split("?")[0]

        if path == "/api/me":
            user = db.get_user_by_session(self.get_session_token())
            if user is None:
                return self.send_json(401, {"error": "Not logged in"})
            return self.send_json(200, {"user": self.user_json(user)})

        # Never serve the database files to the browser
        if path.startswith("/database") or path.endswith(".py"):
            return self.send_error(404)

        return super().do_GET()

    def do_POST(self):
        path = self.path.split("?")[0]
        data = self.read_json()

        if path == "/api/register":
            full_name = str(data.get("full_name", "")).strip()
            email = str(data.get("email", "")).strip()
            password = str(data.get("password", ""))

            if not full_name or not email or not password:
                return self.send_json(400, {"error": "Please fill in all fields."})
            if not EMAIL_PATTERN.match(email):
                return self.send_json(400, {"error": "Please enter a valid email address."})
            if len(password) < 6:
                return self.send_json(400, {"error": "Password must be at least 6 characters."})

            user_id = db.create_user(full_name, email, password)
            if user_id is None:
                return self.send_json(409, {"error": "An account with this email already exists."})

            token = db.create_session(user_id)
            user = db.get_user_by_session(token)
            return self.send_json(
                201,
                {"user": self.user_json(user)},
                [self.session_cookie(token, db.SESSION_DAYS * 86400)],
            )

        if path == "/api/login":
            email = str(data.get("email", "")).strip()
            password = str(data.get("password", ""))
            user = db.verify_user(email, password)
            if user is None:
                return self.send_json(401, {"error": "Incorrect email or password."})

            token = db.create_session(user["id"])
            return self.send_json(
                200,
                {"user": self.user_json(user)},
                [self.session_cookie(token, db.SESSION_DAYS * 86400)],
            )

        if path == "/api/logout":
            token = self.get_session_token()
            if token:
                db.delete_session(token)
            return self.send_json(200, {"ok": True}, [self.session_cookie("", 0)])

        return self.send_json(404, {"error": "Not found"})


if __name__ == "__main__":
    db.init_db()
    print(f"Database ready: {db.DB_FILE}")
    print(f"StudyNest running at http://localhost:{PORT}  (Ctrl+C to stop)")
    ThreadingHTTPServer(("127.0.0.1", PORT), HubHandler).serve_forever()
