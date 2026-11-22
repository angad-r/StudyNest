/**
 * ============================================================================
 * StudyNest - Authentication (Login / Register)
 * ============================================================================
 * Handles:
 * 1. Talking to the Python server's /api/* endpoints
 * 2. Login form (login.html) and Register form (register.html)
 * 3. Protecting the main pages: visitors who aren't logged in go to login.html
 * 4. Showing the student's name and a Logout button in the navbar
 * ============================================================================
 */

var currentUser = null;

/* ----------------------------------------------------------------------------
   1. API Helpers
   ---------------------------------------------------------------------------- */
function apiRequest(method, url, data) {
  return fetch(url, {
    method: method,
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: data ? JSON.stringify(data) : undefined
  }).then(function (res) {
    return res.json().catch(function () { return {}; }).then(function (body) {
      return { ok: res.ok, status: res.status, body: body };
    });
  });
}

function getLocalSessionUser() {
  var saved = localStorage.getItem("hub_session_user");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function setLocalSessionUser(user) {
  localStorage.setItem("hub_session_user", JSON.stringify(user));
}

function clearLocalSessionUser() {
  localStorage.removeItem("hub_session_user");
}

function getLocalUsers() {
  var users = localStorage.getItem("hub_users_store");
  if (users) {
    try {
      return JSON.parse(users);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function saveLocalUser(user) {
  var list = getLocalUsers();
  list.push(user);
  localStorage.setItem("hub_users_store", JSON.stringify(list));
}

function staticLoginFallback(email, password, form) {
  var users = getLocalUsers();
  var match = users.find(function (u) {
    return u.email.toLowerCase() === email.toLowerCase() && u.password === password;
  });

  // Provide an automatic demo account for instant test access on static hosts (like Vercel)
  if (!match && email.toLowerCase() === "demo@studynest.edu") {
    match = { id: "demo", full_name: "Demo Student", email: "demo@studynest.edu" };
  }

  if (match) {
    var userObj = { id: match.id, full_name: match.full_name, email: match.email };
    setLocalSessionUser(userObj);
    showAuthMessage("Login successful! Redirecting...", "success");
    setTimeout(function () {
      window.location.href = "index.html";
    }, 400);
  } else {
    showAuthMessage("Invalid email or password. (On Vercel static demo, you can register a new account or use demo@studynest.edu / any password)");
    setSubmitting(form, false);
  }
}

function staticRegisterFallback(fullName, email, password, form) {
  var users = getLocalUsers();
  var exists = users.some(function (u) {
    return u.email.toLowerCase() === email.toLowerCase();
  });

  if (exists) {
    showAuthMessage("Email is already registered. Please log in.");
    setSubmitting(form, false);
    return;
  }

  var newUser = {
    id: "user_" + Date.now(),
    full_name: fullName,
    email: email.toLowerCase(),
    password: password
  };
  saveLocalUser(newUser);

  var userObj = { id: newUser.id, full_name: newUser.full_name, email: newUser.email };
  setLocalSessionUser(userObj);
  showAuthMessage("Account created successfully! Redirecting...", "success");
  setTimeout(function () {
    window.location.href = "index.html";
  }, 400);
}

function getCurrentUser() {
  return apiRequest("GET", "/api/me").then(function (res) {
    if (res.ok && res.body && res.body.user) {
      return res.body.user;
    }
    // 401 means server is active and user is simply not logged in
    if (res.status === 401) {
      return null;
    }
    // 404 or network error means running in static mode (e.g. Vercel)
    return getLocalSessionUser();
  }).catch(function () {
    return getLocalSessionUser();
  });
}

function showAuthMessage(text, type) {
  var box = document.getElementById("authMessage");
  if (!box) return;
  box.textContent = text;
  box.className = "auth-message " + (type === "success" ? "auth-success" : "auth-error");
  box.hidden = false;
}

function setSubmitting(form, isBusy, busyText) {
  var btn = form.querySelector("button[type='submit']");
  if (!btn) return;
  if (!btn.dataset.label) btn.dataset.label = btn.textContent;
  btn.disabled = isBusy;
  btn.textContent = isBusy ? busyText : btn.dataset.label;
}

/* ----------------------------------------------------------------------------
   2. Login & Register Forms
   ---------------------------------------------------------------------------- */
function initLoginForm() {
  var form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = document.getElementById("loginEmail").value.trim();
    var password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      showAuthMessage("Please enter your email and password.");
      return;
    }

    setSubmitting(form, true, "Logging in...");
    apiRequest("POST", "/api/login", { email: email, password: password })
      .then(function (res) {
        if (res.ok) {
          showAuthMessage("Login successful! Redirecting...", "success");
          window.location.href = "index.html";
        } else if (res.status === 404) {
          // Static deployment fallback (Vercel)
          staticLoginFallback(email, password, form);
        } else {
          showAuthMessage(res.body.error || "Login failed.");
          setSubmitting(form, false);
        }
      })
      .catch(function () {
        // Fallback for static hosting or server offline
        staticLoginFallback(email, password, form);
      });
  });
}

function initRegisterForm() {
  var form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fullName = document.getElementById("regName").value.trim();
    var email = document.getElementById("regEmail").value.trim();
    var password = document.getElementById("regPassword").value;
    var confirmPw = document.getElementById("regConfirm").value;

    if (!fullName || !email || !password || !confirmPw) {
      showAuthMessage("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      showAuthMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPw) {
      showAuthMessage("Passwords do not match.");
      return;
    }

    setSubmitting(form, true, "Creating account...");
    apiRequest("POST", "/api/register", { full_name: fullName, email: email, password: password })
      .then(function (res) {
        if (res.ok) {
          showAuthMessage("Account created! Redirecting...", "success");
          window.location.href = "index.html";
        } else if (res.status === 404) {
          // Static deployment fallback (Vercel)
          staticRegisterFallback(fullName, email, password, form);
        } else {
          showAuthMessage(res.body.error || "Registration failed.");
          setSubmitting(form, false);
        }
      })
      .catch(function () {
        // Fallback for static hosting or server offline
        staticRegisterFallback(fullName, email, password, form);
      });
  });
}

/* ----------------------------------------------------------------------------
   3. Navbar: student name + Logout
   ---------------------------------------------------------------------------- */
function renderNavUser(user) {
  var navMenu = document.getElementById("navMenu");
  if (!navMenu) return;

  var firstName = user.full_name.split(" ")[0];
  var li = document.createElement("li");
  li.className = "nav-user";
  li.innerHTML =
    '<span class="nav-user-name" title="' + sanitize(user.email) + '">&#128100; ' + sanitize(firstName) + '</span>' +
    '<button type="button" class="btn btn-outline btn-sm" id="logoutBtn">Logout</button>';
  navMenu.appendChild(li);

  document.getElementById("logoutBtn").addEventListener("click", function () {
    clearLocalSessionUser();
    apiRequest("POST", "/api/logout").finally(function () {
      window.location.href = "login.html";
    });
  });
}

/* ----------------------------------------------------------------------------
   4. Page Startup
   ---------------------------------------------------------------------------- */
var isAuthPage = !!(document.getElementById("loginForm") || document.getElementById("registerForm"));

// Called by script.js before it loads any page data.
// Resolves with the logged-in user, or sends the visitor to login.html.
function requireLogin() {
  return getCurrentUser().then(function (user) {
    if (!user) {
      window.location.replace("login.html");
      return new Promise(function () {}); // stop here while redirecting
    }
    currentUser = user;
    renderNavUser(user);
    return user;
  });
}

if (isAuthPage) {
  // Already logged in? Skip the login/register page.
  getCurrentUser().then(function (user) {
    if (user) window.location.replace("index.html");
  });
  initLoginForm();
  initRegisterForm();
}
