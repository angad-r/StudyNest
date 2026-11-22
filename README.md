# StudyNest

A clean, responsive, and beginner-friendly college web development project built by a second-year B.Tech student using only standard **HTML5, CSS3, and Vanilla JavaScript** with **browser `localStorage`**.

---

## 1. Project Overview

The **StudyNest** is designed to help college students:
- Find and customize subject-wise notes, formula sheets, and references.
- Maintain and customize a weekly study timetable.
- Keep track of daily revision targets using an interactive study checklist.
- Review high-yield study techniques (Active Recall, Spaced Repetition, 50/10 Focus Cycle, Formula Compression).
- Save all user changes locally in the browser without any backend server, Node.js packages, or database.

---

## 2. File Structure

Consolidated into strictly **3 HTML pages** with one shared stylesheet and one shared JavaScript file:

```text
study-resources-hub/
│
├── index.html              # Homepage: Hero section, quick search, featured subjects, tips preview, college about section
├── resources.html          # Study Resources: Subject cards, live search, category filters, Add/Edit/Delete form
├── planner.html            # Planner & Timetable: Weekly schedule editor, study task checklist, high-yield study tips
│
├── css/
│   └── style.css           # Single shared stylesheet (Flexbox, Grid, educational blue/white theme, mobile & print styles)
│
├── js/
│   └── script.js           # Single vanilla JavaScript file (mobile nav, localStorage CRUD, search, print)
│
├── assets/
│   └── images/
│       ├── logo.svg        # College graduation cap logo
│       └── favicon.svg     # Browser tab favicon icon
│
└── README.md               # Project documentation and College Viva Q&A guide
```

---

## 2b. Login, Register & Database

```text
├── login.html              # Login page
├── register.html           # Register page
├── js/auth.js              # Login/Register forms, page protection, navbar Logout
├── server.py               # Python web server + /api/register, /api/login, /api/logout, /api/me
├── view_database.py        # Prints all registered users from the database
└── database/
    ├── schema.sql          # Table definitions (users, sessions)
    ├── db.py               # All database code (SQLite): users, password hashing, sessions
    └── study_hub.db        # The SQLite database file (created automatically)
```

- Passwords are never stored as plain text; they are hashed with PBKDF2-SHA256 and a random salt.
- After login the server sets an HttpOnly session cookie; every page checks `/api/me` and sends visitors who are not logged in to `login.html`.
- Each student's resources, timetable and tasks are saved under their own `localStorage` keys.

### Run it in VS Code
1. Open the `study-resources-hub` folder in VS Code (File → Open Folder).
2. Install the recommended **Python** extension when VS Code asks.
3. Press **F5** and pick **Run StudyNest (server.py)**, or press **Ctrl/Cmd + Shift + B**.
4. Open http://localhost:8000 in your browser.
5. To browse the database inside VS Code, install the recommended **SQLite Viewer** extension and click `database/study_hub.db`.

### Run it from a terminal (login needs the server)
```bash
python server.py
```
Open http://localhost:8000. To see the users in the database:
```bash
python view_database.py
```

---

## 3. How to Open and Run the Website (old static-only mode)

No installation, build tools, Node.js, or internet connection is required:

### Option A: Direct Browser Launch (Easiest)
1. Open the project folder on your computer.
2. Double-click **`index.html`** to open it directly in any modern browser (Chrome, Edge, Firefox, Brave, Safari).
3. The website runs locally under the standard `file:///` protocol.

### Option B: Local Python Server (Recommended for testing localhost)
Open a terminal / PowerShell inside the project directory and run:
```powershell
python -m http.server 8000
```
Then visit:
```text
http://localhost:8000
```

---

## 4. How the Website Works (Technologies & Architecture)

### HTML5 (Semantic Structure)
- Semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<table>`, `<footer>`) structure the layout cleanly.
- Accessible form elements (`<input>`, `<select>`, `<textarea>`, `<button>`) with clear labels.

### CSS3 (Styling & Responsiveness)
- Educational color palette managed with CSS variables (`--primary-color: #0f4c81`, `--accent-color: #2b6cb0`, `--accent-light: #ebf8ff`).
- **CSS Grid** arranges the responsive subject and resource cards (`repeat(auto-fill, minmax(310px, 1fr))`).
- **Flexbox** powers the navigation header, button groups, and toolbar controls.
- **Media Queries** (`@media (max-width: 768px)`) ensure seamless usability across smartphones and tablets.
- **Print Styles** (`@media print`) format the weekly timetable for clean paper or PDF printing without header, footer, or buttons.

### Vanilla JavaScript & `localStorage` (Interactivity & Persistence)
- **DOM Manipulation:** Standard methods (`getElementById`, `addEventListener`, `innerHTML`) handle all user interactions.
- **Data Persistence:**
  - `hub_resources`: Stores user-customized study resources.
  - `hub_timetable`: Stores customized weekly study and lecture slots.
  - `hub_tasks`: Stores personal daily revision tasks and completion statuses.
- **Storage Functions:**
  ```javascript
  // Reading saved items (with fallback to default sample data):
  var resources = getStorage("hub_resources", defaultResources);

  // Saving items:
  setStorage("hub_resources", resources);
  ```
- **Browser Privacy:** Changes are stored strictly in the user's browser `localStorage`. No server, cloud database, or third-party cookies are used.

---

## 5. College Viva Questions & Answers (Exam Preparation)

### Q1: What is the objective of this project?
> *"This project is an academic web portal that helps college students organize study resources, revision strategies, and daily schedules. It allows students to customize subject notes, edit timetable slots, and check off revision tasks, with all changes saved automatically in their browser."*

### Q2: Why did you build this with vanilla HTML/CSS/JS instead of React or Bootstrap?
> *"This project was intentionally built using pure HTML5, CSS3, and vanilla JavaScript to master the fundamental concepts of web development — semantic HTML markup, responsive layouts using Flexbox and Grid, DOM manipulation, and browser client-side storage — without relying on external libraries or frameworks."*

### Q3: How do the editable features work without a backend database?
> *"When a user adds, edits, or deletes an item, JavaScript captures the data, updates the in-memory array, and saves it to the browser's `localStorage` using `JSON.stringify()`. On page load, `JSON.parse(localStorage.getItem(...))` restores the saved data. If no saved data exists, default sample data is loaded automatically."*

### Q4: How is mobile responsiveness implemented?
> *"Responsive design is achieved using CSS Flexbox, CSS Grid (`minmax`), a viewport meta tag, and a `@media (max-width: 768px)` media query. On mobile devices, the navigation menu switches to an interactive toggle menu, and multi-column card grids collapse gracefully into a single column."*

### Q5: How does the timetable print feature work?
> *"The Print button triggers `window.print()`. A dedicated `@media print` CSS block hides the header, footer, buttons, and search forms, ensuring only the timetable table prints cleanly across standard A4 paper or PDF."*

---

## 6. Deployment on Vercel

1. Push this repository to GitHub under [github.com/angad-r/StudyNest](https://github.com/angad-r/StudyNest).
2. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
3. Click **"Add New Project"** &rarr; **"Import"** next to `StudyNest`.
4. Keep the default settings (Framework: **Other**, Root Directory: `./`).
5. Click **"Deploy"**.
6. Your site is live! You can log in, register, and use all planner and resource features directly in your browser.

---

## Author & Developer
- **Developer**: Angad Ranjan
- **GitHub**: [@angad-r](https://github.com/angad-r)
- **Repository**: [https://github.com/angad-r/StudyNest](https://github.com/angad-r/StudyNest)
