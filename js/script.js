/**
 * ============================================================================
 * StudyNest - JavaScript
 * College Web Development Project (HTML5, CSS3, Vanilla JavaScript)
 * ============================================================================
 * Handles:
 * 1. Mobile menu toggle
 * 2. Editable Resources (Add, Edit, Delete, Search, Reset)
 * 3. Editable Weekly Timetable (Add/Edit session, Clear slot, Reset, Print)
 * 4. Personal Study Tasks Checklist (Add task, Complete toggle, Delete)
 * ============================================================================
 */

// Each logged-in student gets their own saved data (e.g. hub_resources_user3)
var storagePrefix = "";

document.addEventListener("DOMContentLoaded", function () {
  initMobileNav();

  // requireLogin() comes from auth.js - it redirects to login.html if needed
  requireLogin().then(function (user) {
    storagePrefix = "_user" + user.id;
    initResourcesPage();
    initPlannerPage();
  });
});

/* ----------------------------------------------------------------------------
   1. LocalStorage Helpers
   ---------------------------------------------------------------------------- */
function getStorage(key, defaultData) {
  var saved = localStorage.getItem(key + storagePrefix);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (err) {
      return defaultData;
    }
  }
  return defaultData;
}

function setStorage(key, data) {
  localStorage.setItem(key + storagePrefix, JSON.stringify(data));
}

function sanitize(text) {
  if (!text) return "";
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* ----------------------------------------------------------------------------
   2. Mobile Navigation Toggle
   ---------------------------------------------------------------------------- */
function initMobileNav() {
  var toggleBtn = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener("click", function () {
    navMenu.classList.toggle("active");
  });
}

/* ----------------------------------------------------------------------------
   3. Resources Page (resources.html)
   ---------------------------------------------------------------------------- */
var defaultResources = [
  {
    title: "Mathematics & Calculus",
    category: "math",
    type: "Formula Guide & Notes",
    desc: "Differential calculus, limit theorems, integration techniques, and linear algebra matrices for engineering exams.",
    url: "https://openstax.org/details/books/calculus-volume-1",
    isCustom: false
  },
  {
    title: "Programming in C",
    category: "cs",
    type: "Code Samples & Cheatsheet",
    desc: "Pointers, dynamic memory allocation (malloc, free), structs, file I/O, and common semester exam coding questions.",
    url: "https://www.w3schools.com/c/",
    isCustom: false
  },
  {
    title: "Engineering Physics",
    category: "science",
    type: "Derivations & Formulas",
    desc: "Wave optics (interference, diffraction), lasers, fiber optics, and semiconductor physics with key derivations.",
    url: "https://openstax.org/details/books/university-physics-volume-1",
    isCustom: false
  },
  {
    title: "Electrical & Electronics Engineering",
    category: "engineering",
    type: "Circuit Theorems & Diagrams",
    desc: "DC and AC circuit analysis, Ohm's law, Kirchhoff's laws, Thevenin theorem, and semiconductor PN junction diodes.",
    url: "https://www.allaboutcircuits.com/textbook/",
    isCustom: false
  },
  {
    title: "Engineering Chemistry",
    category: "science",
    type: "Reaction Mechanisms & Notes",
    desc: "Water technology (hardness, EDTA method), electrochemistry, battery chemistry, and corrosion control methods.",
    url: "https://chem.libretexts.org",
    isCustom: false
  },
  {
    title: "Computer Science Fundamentals",
    category: "cs",
    type: "Core Concepts & Architecture",
    desc: "Boolean logic, CPU architecture, operating system basics, and introductory linear data structures (stacks, queues).",
    url: "https://ocw.mit.edu",
    isCustom: false
  },
  {
    title: "Data Structures & Algorithms",
    category: "cs",
    type: "Cheatsheet & Problem Patterns",
    desc: "Arrays, linked lists, trees, binary search, graphs, dynamic programming, sorting algorithms, and asymptotic Big-O analysis.",
    url: "https://www.geeksforgeeks.org/data-structures/",
    isCustom: false
  },
  {
    title: "Database Management Systems (DBMS)",
    category: "cs",
    type: "SQL Guide & Normalization",
    desc: "Relational model, SQL DDL/DML, ER diagrams, functional dependencies, 1NF-BCNF normalization, and ACID transaction rules.",
    url: "https://www.w3schools.com/sql/",
    isCustom: false
  },
  {
    title: "Operating Systems & Concurrency",
    category: "cs",
    type: "Core Architecture & Cheatsheet",
    desc: "Process lifecycle, CPU scheduling, semaphores, mutexes, deadlock avoidance (Banker's algorithm), and paging/virtual memory.",
    url: "https://www.geeksforgeeks.org/operating-systems/",
    isCustom: false
  },
  {
    title: "Computer Networks & Protocols",
    category: "cs",
    type: "Layers & Routing Guide",
    desc: "OSI 7-layer reference model, TCP/IP stack, IPv4/IPv6 subnetting, transport layer sockets, and routing algorithms (Dijkstra, Distance Vector).",
    url: "https://www.geeksforgeeks.org/computer-network-tutorials/",
    isCustom: false
  },
  {
    title: "Object-Oriented Programming with Java",
    category: "cs",
    type: "Code Patterns & Notes",
    desc: "Classes, encapsulation, inheritance, polymorphism, interfaces, exception handling, and Java Collections framework fundamentals.",
    url: "https://www.w3schools.com/java/",
    isCustom: false
  },
  {
    title: "Web Technologies & Frontend",
    category: "cs",
    type: "Standards & Reference Guide",
    desc: "Semantic HTML5, CSS Grid & Flexbox, DOM manipulation, ES6+ JavaScript, Fetch API, and responsive web design best practices.",
    url: "https://developer.mozilla.org",
    isCustom: false
  },
  {
    title: "Discrete Mathematics & Graph Theory",
    category: "math",
    type: "Proofs & Formula Guide",
    desc: "Propositional and predicate logic, set operations, relations, recurrence relations, graph traversals, and combinatorics.",
    url: "https://www.geeksforgeeks.org/discrete-mathematics-tutorial/",
    isCustom: false
  },
  {
    title: "Linear Algebra & Vector Spaces",
    category: "math",
    type: "Formula Sheet & Solved Proofs",
    desc: "Matrix determinants, rank, vector spaces, subspaces, eigenvalues and eigenvectors, diagonalization, and orthogonalization.",
    url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
    isCustom: false
  },
  {
    title: "Probability & Statistics",
    category: "math",
    type: "Distribution Tables & Formulas",
    desc: "Conditional probability, Bayes' theorem, discrete/continuous random variables, Poisson and Normal distributions, and hypothesis testing.",
    url: "https://openstax.org/details/books/introductory-statistics",
    isCustom: false
  },
  {
    title: "Digital Logic & Microprocessor Design",
    category: "engineering",
    type: "Truth Tables & Circuit Schematics",
    desc: "Boolean algebra simplification, Karnaugh maps (K-maps), multiplexers, decoders, flip-flops (SR, JK, D, T), and ALU basics.",
    url: "https://www.allaboutcircuits.com/textbook/digital/",
    isCustom: false
  },
  {
    title: "Signals & Systems",
    category: "engineering",
    type: "Transform Tables & Formulas",
    desc: "Continuous and discrete-time signal properties, linear time-invariant (LTI) systems, Fourier transforms, Laplace transforms, and Z-transforms.",
    url: "https://ocw.mit.edu",
    isCustom: false
  },
  {
    title: "Environmental Science & Engineering",
    category: "science",
    type: "Summary Notes & Case Studies",
    desc: "Ecosystem structure, renewable solar/wind energy, air and water pollution standards, solid waste management, and environmental audits.",
    url: "https://openstax.org",
    isCustom: false
  }
];

function initResourcesPage() {
  var grid = document.getElementById("resourceGrid");
  if (!grid) return; // Only runs on resources.html

  var searchInput = document.getElementById("resourceSearch");
  var filterButtons = document.querySelectorAll(".filter-btn");
  var countEl = document.getElementById("resultsCount");
  var toggleFormBtn = document.getElementById("toggleResourceFormBtn");
  var formBox = document.getElementById("resourceFormBox");
  var form = document.getElementById("resourceForm");
  var cancelBtn = document.getElementById("cancelResourceBtn");
  var resetBtn = document.getElementById("resetResourcesBtn");

  var editIndexInput = document.getElementById("resourceEditIndex");
  var titleInput = document.getElementById("resourceTitle");
  var categorySelect = document.getElementById("resourceCategory");
  var typeInput = document.getElementById("resourceType");
  var urlInput = document.getElementById("resourceUrl");
  var descInput = document.getElementById("resourceDesc");
  var formTitle = document.getElementById("resourceFormTitle");

  var savedResources = getStorage("hub_resources", null);
  var resources;
  if (!savedResources) {
    resources = JSON.parse(JSON.stringify(defaultResources));
  } else {
    resources = savedResources;
    var existingTitles = {};
    resources.forEach(function (r) {
      if (r && r.title) existingTitles[r.title.toLowerCase()] = true;
    });
    defaultResources.forEach(function (def) {
      if (!existingTitles[def.title.toLowerCase()]) {
        resources.push(def);
      }
    });
    setStorage("hub_resources", resources);
  }
  var activeCategory = "all";

  function render() {
    var query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    var visibleCount = 0;
    grid.innerHTML = "";

    resources.forEach(function (res, index) {
      var matchCategory = (activeCategory === "all") || (res.category === activeCategory);
      var cardText = (res.title + " " + res.desc + " " + res.type).toLowerCase();
      var matchSearch = query === "" || cardText.indexOf(query) !== -1;

      if (matchCategory && matchSearch) {
        visibleCount++;

        var card = document.createElement("article");
        card.className = "card";

        var badgeClass = res.isCustom ? "badge-purple" : "badge-blue";
        var badgeText = res.isCustom ? "Custom" : res.category.toUpperCase();
        var linkUrl = res.url ? res.url : "#";
        var externalTarget = res.url && res.url.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : '';

        card.innerHTML =
          '<div class="card-header">' +
            '<div>' +
              '<h3 class="card-title">' + sanitize(res.title) + '</h3>' +
              '<span class="badge ' + badgeClass + '">' + sanitize(badgeText) + '</span>' +
            '</div>' +
          '</div>' +
          '<p class="card-desc">' + sanitize(res.desc) + '</p>' +
          '<div class="card-meta">' +
            '<span class="badge badge-green">' + sanitize(res.type) + '</span>' +
          '</div>' +
          '<div class="card-footer">' +
            (res.url ? '<a href="' + sanitize(linkUrl) + '"' + externalTarget + ' class="btn btn-primary btn-sm">Open Link ↗</a>' : '') +
            '<button type="button" class="btn btn-outline btn-sm edit-res-btn" data-index="' + index + '">Edit</button>' +
            '<button type="button" class="btn btn-danger btn-sm delete-res-btn" data-index="' + index + '">Delete</button>' +
          '</div>';

        grid.appendChild(card);
      }
    });

    if (countEl) {
      countEl.textContent = "Showing " + visibleCount + " of " + resources.length + " resources";
    }

    if (visibleCount === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 25px; color: #718096;">No resources match your search.</p>';
    }

    attachCardEvents();
  }

  function attachCardEvents() {
    var editBtns = grid.querySelectorAll(".edit-res-btn");
    editBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-index"), 10);
        var res = resources[idx];
        editIndexInput.value = idx;
        titleInput.value = res.title;
        categorySelect.value = res.category;
        typeInput.value = res.type;
        urlInput.value = res.url || "";
        descInput.value = res.desc;
        formTitle.textContent = "Edit Study Resource";
        formBox.style.display = "block";
        formBox.scrollIntoView({ behavior: "smooth" });
      });
    });

    var deleteBtns = grid.querySelectorAll(".delete-res-btn");
    deleteBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-index"), 10);
        if (confirm("Delete the resource '" + resources[idx].title + "'?")) {
          resources.splice(idx, 1);
          setStorage("hub_resources", resources);
          render();
        }
      });
    });
  }

  // Toggle Add Form
  if (toggleFormBtn) {
    toggleFormBtn.addEventListener("click", function () {
      if (formBox.style.display === "none" || formBox.style.display === "") {
        form.reset();
        editIndexInput.value = "-1";
        formTitle.textContent = "Add New Study Resource";
        formBox.style.display = "block";
        formBox.scrollIntoView({ behavior: "smooth" });
      } else {
        formBox.style.display = "none";
      }
    });
  }

  // Cancel Form
  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      formBox.style.display = "none";
      form.reset();
    });
  }

  // Save Form (Add or Edit)
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var titleVal = titleInput.value.trim();
      var categoryVal = categorySelect.value;
      var typeVal = typeInput.value.trim();
      var urlVal = urlInput.value.trim();
      var descVal = descInput.value.trim();
      var editIdx = parseInt(editIndexInput.value, 10);

      if (!titleVal || !typeVal || !descVal) {
        alert("Please fill in all required fields.");
        return;
      }

      var item = {
        title: titleVal,
        category: categoryVal,
        type: typeVal,
        url: urlVal,
        desc: descVal,
        isCustom: true
      };

      if (editIdx >= 0) {
        resources[editIdx] = item;
      } else {
        resources.unshift(item);
      }

      setStorage("hub_resources", resources);
      formBox.style.display = "none";
      form.reset();
      render();
    });
  }

  // Reset to default resources
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (confirm("Restore default sample resources? Any custom added items will be reset.")) {
        resources = JSON.parse(JSON.stringify(defaultResources));
        setStorage("hub_resources", resources);
        render();
      }
    });
  }

  // Search input event
  if (searchInput) {
    searchInput.addEventListener("input", render);
  }

  // Category filter buttons
  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-filter") || "all";
      render();
    });
  });

  // URL search parameter support (?search=calculus)
  var urlParams = new URLSearchParams(window.location.search);
  var initialSearch = urlParams.get("search");
  if (initialSearch && searchInput) {
    searchInput.value = initialSearch;
  }

  render();
}

/* ----------------------------------------------------------------------------
   4. Planner Page: Timetable & Tasks (planner.html)
   ---------------------------------------------------------------------------- */
var defaultTimetable = [
  {
    time: "07:00 AM – 08:00 AM",
    isBreak: false,
    mon: "Physics Theory",
    tue: "Calculus Warmup",
    wed: "Chemistry Notes",
    thu: "Electrical Theory",
    fri: "Calculus Practice",
    sat: "Weekly Revision"
  },
  {
    time: "08:00 AM – 09:00 AM",
    isBreak: true,
    breakText: "Breakfast & College Commute"
  },
  {
    time: "09:00 AM – 01:00 PM",
    isBreak: false,
    mon: "College Lectures",
    tue: "College Lectures",
    wed: "C Programming Lab",
    thu: "College Lectures",
    fri: "Physics Lab",
    sat: "Project Work"
  },
  {
    time: "01:00 PM – 02:00 PM",
    isBreak: true,
    breakText: "Lunch Break & Rest"
  },
  {
    time: "02:00 PM – 04:30 PM",
    isBreak: false,
    mon: "College Labs",
    tue: "Library Reading",
    wed: "College Lectures",
    thu: "Electronics Lab",
    fri: "Tutorial Doubts",
    sat: "Problem Solving"
  },
  {
    time: "04:30 PM – 06:00 PM",
    isBreak: true,
    breakText: "Commute Home & Sports / Walk"
  },
  {
    time: "06:00 PM – 08:00 PM",
    isBreak: false,
    mon: "C Programming",
    tue: "Calculus Practice",
    wed: "C Practice Problems",
    thu: "Circuit Analysis",
    fri: "Data Structures",
    sat: "Past Exam Paper"
  },
  {
    time: "08:00 PM – 09:00 PM",
    isBreak: true,
    breakText: "Dinner & Downtime"
  },
  {
    time: "09:00 PM – 10:30 PM",
    isBreak: false,
    mon: "Active Recall",
    tue: "Active Recall",
    wed: "Formula Sheet",
    thu: "Active Recall",
    fri: "Weekly Review",
    sat: "Light Reading"
  },
  {
    time: "10:30 PM – 07:00 AM",
    isBreak: true,
    breakText: "Sleep & Rest (8.5 Hours)"
  }
];

var defaultTasks = [
  { id: 1, title: "Solve 5 Double Integral Past Exam Questions", subject: "Mathematics", completed: false },
  { id: 2, title: "Review Pointers & Memory Allocation (malloc/free) in C", subject: "Programming in C", completed: false },
  { id: 3, title: "Revise Wave Optics Fringe Width Derivation", subject: "Physics", completed: true },
  { id: 4, title: "Write Thevenin and Norton Equivalent Circuits", subject: "Electrical Eng", completed: false }
];

function initPlannerPage() {
  var tbody = document.getElementById("timetableBody");
  var taskList = document.getElementById("taskList");
  if (!tbody && !taskList) return; // Only runs on planner.html

  // --- Part A: Weekly Timetable Logic ---
  if (tbody) {
    var formBox = document.getElementById("sessionFormBox");
    var toggleFormBtn = document.getElementById("toggleSessionFormBtn");
    var form = document.getElementById("sessionForm");
    var cancelBtn = document.getElementById("cancelSessionBtn");
    var clearBtn = document.getElementById("clearSessionBtn");
    var resetBtn = document.getElementById("resetTimetableBtn");
    var printBtn = document.getElementById("printTimetableBtn");

    var slotSelect = document.getElementById("sessionSlotIndex");
    var daySelect = document.getElementById("sessionDay");
    var subjectInput = document.getElementById("sessionSubject");

    var schedule = getStorage("hub_timetable", defaultTimetable);

    function renderTimetable() {
      tbody.innerHTML = "";

      schedule.forEach(function (slot, slotIdx) {
        var row = document.createElement("tr");

        var th = document.createElement("th");
        th.className = "time-slot";
        th.setAttribute("scope", "row");
        th.textContent = slot.time;
        row.appendChild(th);

        if (slot.isBreak) {
          var td = document.createElement("td");
          td.colSpan = 6;
          td.className = "slot-break";
          td.textContent = slot.breakText;
          row.appendChild(td);
        } else {
          var days = ["mon", "tue", "wed", "thu", "fri", "sat"];
          days.forEach(function (d) {
            var td = document.createElement("td");
            var text = slot[d] || "Free Slot";
            td.textContent = text;

            if (text === "Free Slot") {
              td.style.color = "#a0aec0";
              td.style.fontStyle = "italic";
            } else {
              td.className = "slot-study";
            }

            // Click cell to edit or clear
            td.style.cursor = "pointer";
            td.title = "Click to edit or clear this slot";
            td.addEventListener("click", function () {
              slotSelect.value = slotIdx;
              daySelect.value = d;
              subjectInput.value = (text === "Free Slot") ? "" : text;
              formBox.style.display = "block";
              formBox.scrollIntoView({ behavior: "smooth" });
            });

            row.appendChild(td);
          });
        }

        tbody.appendChild(row);
      });
    }

    if (toggleFormBtn) {
      toggleFormBtn.addEventListener("click", function () {
        if (formBox.style.display === "none" || formBox.style.display === "") {
          formBox.style.display = "block";
          formBox.scrollIntoView({ behavior: "smooth" });
        } else {
          formBox.style.display = "none";
        }
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        formBox.style.display = "none";
        form.reset();
      });
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var slotIdx = parseInt(slotSelect.value, 10);
        var day = daySelect.value;
        var subjectVal = subjectInput.value.trim();

        if (!subjectVal) {
          alert("Please enter a subject name.");
          return;
        }

        if (schedule[slotIdx].isBreak) {
          alert("This time slot is designated as a common break/meal time.");
          return;
        }

        schedule[slotIdx][day] = subjectVal;
        setStorage("hub_timetable", schedule);
        formBox.style.display = "none";
        form.reset();
        renderTimetable();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        var slotIdx = parseInt(slotSelect.value, 10);
        var day = daySelect.value;

        if (schedule[slotIdx].isBreak) {
          alert("Cannot clear a designated break/meal slot.");
          return;
        }

        var dayName = daySelect.options[daySelect.selectedIndex].text;
        if (confirm("Clear the scheduled session on " + dayName + "?")) {
          schedule[slotIdx][day] = "Free Slot";
          setStorage("hub_timetable", schedule);
          formBox.style.display = "none";
          form.reset();
          renderTimetable();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (confirm("Restore the default semester timetable? Your custom edits will be reset.")) {
          schedule = JSON.parse(JSON.stringify(defaultTimetable));
          setStorage("hub_timetable", schedule);
          renderTimetable();
        }
      });
    }

    if (printBtn) {
      printBtn.addEventListener("click", function () {
        window.print();
      });
    }

    renderTimetable();
  }

  // --- Part B: Personal Study Tasks Logic ---
  if (taskList) {
    var taskForm = document.getElementById("taskForm");
    var taskTitleInput = document.getElementById("taskTitle");
    var taskSubjectInput = document.getElementById("taskSubject");
    var resetTasksBtn = document.getElementById("resetTasksBtn");

    var tasks = getStorage("hub_tasks", defaultTasks);

    function renderTasks() {
      taskList.innerHTML = "";

      if (tasks.length === 0) {
        taskList.innerHTML = '<p style="text-align: center; color: #718096; padding: 15px;">No study tasks added yet. Add one above!</p>';
        return;
      }

      tasks.forEach(function (task, index) {
        var item = document.createElement("div");
        item.className = "task-item" + (task.completed ? " completed" : "");

        item.innerHTML =
          '<div class="task-left">' +
            '<input type="checkbox" class="task-checkbox toggle-task" data-index="' + index + '" ' + (task.completed ? "checked" : "") + ' aria-label="Toggle completed">' +
            '<div>' +
              '<span class="task-text">' + sanitize(task.title) + '</span>' +
              (task.subject ? ' <span class="badge badge-blue" style="margin-left: 6px;">' + sanitize(task.subject) + '</span>' : '') +
            '</div>' +
          '</div>' +
          '<button type="button" class="btn btn-danger btn-sm delete-task-btn" data-index="' + index + '">Delete</button>';

        taskList.appendChild(item);
      });

      // Toggle checkboxes
      var checkboxes = taskList.querySelectorAll(".toggle-task");
      checkboxes.forEach(function (cb) {
        cb.addEventListener("change", function () {
          var idx = parseInt(cb.getAttribute("data-index"), 10);
          tasks[idx].completed = cb.checked;
          setStorage("hub_tasks", tasks);
          renderTasks();
        });
      });

      // Delete buttons
      var deleteBtns = taskList.querySelectorAll(".delete-task-btn");
      deleteBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var idx = parseInt(btn.getAttribute("data-index"), 10);
          if (confirm("Delete the study task '" + tasks[idx].title + "'?")) {
            tasks.splice(idx, 1);
            setStorage("hub_tasks", tasks);
            renderTasks();
          }
        });
      });
    }

    // Add Task
    if (taskForm) {
      taskForm.addEventListener("submit", function (e) {
        e.preventDefault();

        var titleVal = taskTitleInput.value.trim();
        var subjectVal = taskSubjectInput.value.trim();

        if (!titleVal) {
          alert("Please enter a task title.");
          return;
        }

        var newTask = {
          id: Date.now(),
          title: titleVal,
          subject: subjectVal ? subjectVal : "General",
          completed: false
        };

        tasks.unshift(newTask);
        setStorage("hub_tasks", tasks);
        taskForm.reset();
        renderTasks();
      });
    }

    // Reset Tasks
    if (resetTasksBtn) {
      resetTasksBtn.addEventListener("click", function () {
        if (confirm("Restore starter sample tasks?")) {
          tasks = JSON.parse(JSON.stringify(defaultTasks));
          setStorage("hub_tasks", tasks);
          renderTasks();
        }
      });
    }

    renderTasks();
  }
}
