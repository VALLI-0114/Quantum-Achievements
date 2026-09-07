/**
 * Q-HUB Main Application & Quantum Achievements DBMS Controller
 * Real-time reactive data rendering with full CRUD operations for Students & Faculty.
 * Purely showcases completed quantum achievements, certified courses, papers, and credentials.
 */

const Q_APP = {
  currentView: "home",
  activeStudentId: "STU-001",
  activeFacultyId: "FAC-001",

  init() {
    this.bindNavigation();
    this.renderAllViews();
    this.initMobileSidebar();

    // Default view setup
    this.switchView("home");

    // Initialize search & charts
    Q_SEARCH.init();
    setTimeout(() => {
      Q_CHARTS.initAllCharts();
    }, 200);
  },

  renderAllViews() {
    this.renderStatsCounters();
    this.renderStudentAggregates();
    this.renderStudentsDBMS();
    this.renderFacultyDBMS();
    this.renderProjects("All");
    this.renderCertificates();
    this.renderResearch("All");
    this.renderAchievers();
    this.renderEvents();
    this.renderReadiness();
  },

  // 1. Navigation & View Switching
  bindNavigation() {
    document.querySelectorAll("[data-view-target]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const target = btn.getAttribute("data-view-target");
        this.switchView(target);
      });
    });
  },

  switchView(viewName) {
    this.currentView = viewName;

    // Update active state in sidebar and topnav
    document.querySelectorAll(".nav-link").forEach(link => {
      if (link.getAttribute("data-view-target") === viewName) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Toggle view sections
    document.querySelectorAll(".app-view-section").forEach(sec => {
      sec.style.display = "none";
    });

    const activeSec = document.getElementById(`view-${viewName}`);
    if (activeSec) {
      activeSec.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Refresh charts if entering analytics view
    if (viewName === "analytics") {
      setTimeout(() => Q_CHARTS.initAllCharts(), 100);
    }

    // Close mobile sidebar if open
    const sidebar = document.getElementById("appSidebar");
    if (sidebar) sidebar.classList.remove("open");
  },

  initMobileSidebar() {
    const toggleBtn = document.getElementById("mobileSidebarToggle");
    const sidebar = document.getElementById("appSidebar");
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
      });
    }
  },

  openQuickAddModal() {
    const modal = document.getElementById("quickAddModal");
    if (modal) modal.classList.add("open");
  },

  // 2. Statistics Counters
  renderStatsCounters() {
    const s = Q_DB.getStats();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal("stat-students", s.totalStudents);
    setVal("stat-learners", s.quantumLearners);
    setVal("stat-courses", s.coursesCount);
    setVal("stat-faculty", s.facultyTrained);
    setVal("stat-projects", s.projectsCount);
    setVal("stat-papers", s.researchPapers);
    setVal("stat-certs", s.certificatesCount);
  },

  // 3. Student Aggregate Metrics & Achievements Dashboard
  renderStudentAggregates() {
    const students = Q_DB.getStudents();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    const totalCourses = students.reduce((sum, s) => sum + (parseInt(s.courses) || 0), 0);
    const totalCerts = students.reduce((sum, s) => sum + (parseInt(s.certificates) || 0), 0);
    const totalProjects = students.reduce((sum, s) => sum + (parseInt(s.projects) || 0), 0);
    const totalPapers = students.reduce((sum, s) => sum + (parseInt(s.researchPapers) || 0), 0);
    const totalHackathons = students.reduce((sum, s) => sum + (parseInt(s.hackathons) || 0), 0);

    setVal("aggStudentCount", students.length);
    setVal("aggCoursesCount", totalCourses);
    setVal("aggCertsCount", totalCerts);
    setVal("aggProjectsCount", totalProjects);
    setVal("aggPapersCount", totalPapers);
    setVal("aggHackathonsCount", totalHackathons);
  },

  // ---------------- 4. STUDENTS DBMS DATA TABLE & ALL-STUDENTS SHOWCASE ----------------
  renderStudentsDBMS(filterDept = "All", searchQuery = "") {
    const container = document.getElementById("studentsDBMSList");
    if (!container) return;

    let students = Q_DB.getStudents();

    // Filter by department
    if (filterDept && filterDept !== "All") {
      students = students.filter(s => s.department && s.department.toLowerCase().includes(filterDept.toLowerCase()));
    }

    // Filter by search query
    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      students = students.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        (s.highestHonor && s.highestHonor.toLowerCase().includes(q)) ||
        (s.skills && s.skills.some(sk => sk.toLowerCase().includes(q))) ||
        (s.completedCoursesList && s.completedCoursesList.some(c => c.name.toLowerCase().includes(q))) ||
        (s.hackathonsList && s.hackathonsList.some(h => h.toLowerCase().includes(q)))
      );
    }

    const allDepts = ["All", "Information Technology", "Computer Science", "Physics & Quantum Optics", "Electronics", "Mathematics"];

    container.innerHTML = `
      <div class="dbms-toolbar" style="flex-wrap:wrap; gap:1rem; margin-bottom:1rem;">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <h3 style="font-size:1.15rem; margin:0;">Student Quantum Achievement Records (${students.length})</h3>
          <span class="badge badge-primary">DBMS Active</span>
        </div>
        
        <!-- Dedicated Student Real-Time Search Bar -->
        <div style="flex:1; min-width:280px; max-width:420px; position:relative;">
          <input 
            type="text" 
            id="studentTableSearchInput" 
            class="dbms-form-input" 
            placeholder="🔍 Search student name, ID, course, hackathon, honor..." 
            value="${searchQuery}" 
            oninput="Q_APP.renderStudentsDBMS('${filterDept}', this.value)"
            style="padding-left:0.85rem; font-size:0.88rem;"
          >
        </div>

        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-primary btn-sm" onclick="Q_APP.openAddStudentModal()">
            ➕ Add Student Record
          </button>
          <button class="btn btn-outline btn-sm" onclick="Q_DB.exportJSON()">
            📥 Export JSON
          </button>
        </div>
      </div>

      <!-- Department Filter Pills -->
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.25rem;">
        ${allDepts.map(d => `
          <button 
            class="filter-pill ${filterDept === d ? 'active' : ''}" 
            onclick="Q_APP.renderStudentsDBMS('${d}', document.getElementById('studentTableSearchInput') ? document.getElementById('studentTableSearchInput').value : '')"
          >
            ${d}
          </button>
        `).join("")}
      </div>

      <div class="dbms-table-wrapper">
        <table class="dbms-table">
          <thead>
            <tr>
              <th>Student Candidate</th>
              <th>Student ID / Roll</th>
              <th>Department</th>
              <th>Highest Honor / Credential</th>
              <th>Completed Courses</th>
              <th style="text-align:center;">Certificates</th>
              <th style="text-align:center;">Projects</th>
              <th style="text-align:center;">Research Papers</th>
              <th style="text-align:center;">Hackathons</th>
              <th style="text-align:center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${students.length === 0 ? `
              <tr>
                <td colspan="10" style="text-align:center; padding:2.5rem; color:var(--text-muted);">
                  No student achievement records found matching your search.
                </td>
              </tr>
            ` : students.map(s => {
              const coursesList = s.completedCoursesList && s.completedCoursesList.length ? s.completedCoursesList : [
                { name: "QC-101: Quantum Foundations", platform: "Q-HUB" },
                { name: "QC-102: Qiskit Developer", platform: "IBM Quantum" }
              ];

              return `
              <tr>
                <td>
                  <div class="dbms-user-cell">
                    <div class="dbms-user-avatar">${s.avatar || s.name.slice(0,2).toUpperCase()}</div>
                    <div>
                      <strong style="color:var(--text-primary); font-size:0.92rem;">${s.name}</strong>
                      <div style="font-size:0.75rem; color:var(--text-muted);">${s.year || 'Undergraduate'} • ${s.email}</div>
                    </div>
                  </div>
                </td>
                <td><span style="font-family:var(--font-mono); font-weight:600; color:var(--primary); font-size:0.85rem;">${s.studentId}</span></td>
                <td><span style="font-size:0.82rem; color:var(--text-secondary);">${s.department}</span></td>
                <td>
                  <span class="badge badge-teal" style="font-size:0.76rem; font-weight:600;">
                    ${s.highestHonor || 'Quantum Certified Scholar'}
                  </span>
                </td>
                <td>
                  <div style="display:flex; flex-direction:column; gap:0.25rem;">
                    <div style="font-weight:700; color:var(--text-primary); font-size:0.85rem;">
                      ${s.courses} Completed
                    </div>
                    <div style="display:flex; flex-wrap:wrap; gap:0.25rem; max-width:260px;">
                      ${coursesList.slice(0, 2).map(c => `
                        <span class="badge badge-primary" style="font-size:0.68rem; padding:0.15rem 0.4rem;" title="${c.name} (${c.platform})">
                          ${c.name.split(":")[0]}
                        </span>
                      `).join("")}
                      ${coursesList.length > 2 ? `<span class="badge badge-secondary" style="font-size:0.68rem;">+${coursesList.length - 2} more</span>` : ''}
                    </div>
                  </div>
                </td>
                <td style="text-align:center;"><strong style="color:var(--primary); font-size:0.95rem;">${s.certificates}</strong></td>
                <td style="text-align:center;"><strong style="color:var(--secondary); font-size:0.95rem;">${s.projects}</strong></td>
                <td style="text-align:center;"><strong style="color:var(--accent-teal); font-size:0.95rem;">${s.researchPapers}</strong></td>
                <td style="text-align:center;">
                  <span class="badge badge-primary" style="font-size:0.78rem; font-weight:700;">
                    🏆 ${s.hackathons || 0}
                  </span>
                </td>
                <td style="text-align:center;">
                  <div class="dbms-actions-cell" style="justify-content:center;">
                    <button class="btn btn-outline btn-sm btn-icon" title="View Full Portfolio" onclick="Q_APP.openStudentPortfolioModal('${s.id}')">
                      👁️ View Portfolio
                    </button>
                    <button class="btn btn-outline btn-sm btn-icon" title="Edit Record" onclick="Q_APP.openEditStudentModal('${s.id}')">
                      ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-sm btn-icon" title="Delete Record" onclick="Q_APP.deleteStudentRecord('${s.id}')">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            `}).join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  // Candidate Full Achievement Portfolio Modal
  openStudentPortfolioModal(studentId) {
    const student = Q_DB.getStudentById(studentId);
    if (!student) return;

    const modal = document.getElementById("studentPortfolioModal");
    const body = document.getElementById("studentPortfolioBody");
    const title = document.getElementById("portfolioModalTitle");
    if (!modal || !body) return;

    if (title) title.textContent = `${student.name} • Quantum Achievement Portfolio`;

    const completions = student.completedCoursesList && student.completedCoursesList.length ? student.completedCoursesList : [
      { name: "QC-101: Quantum Computing Foundations", platform: "Q-HUB Academy", credentialId: `QHUB-QCF-${student.id}`, date: "2025", grade: "Distinction" },
      { name: "QC-102: Qiskit Developer Fundamentals", platform: "IBM Quantum", credentialId: `QIS-DEV-${student.id}`, date: "2025", grade: "Certified" }
    ];

    const timelineData = student.timeline && student.timeline.length ? student.timeline : [
      { year: "2025", title: "Started Quantum Track", desc: "Completed verified foundations course with distinction." },
      { year: "2026", title: "Earned Credential", desc: student.highestHonor || "Quantum Certified Developer" }
    ];

    const hackathonsList = student.hackathonsList && student.hackathonsList.length ? student.hackathonsList : [
      "Annual University Quantum Hackathon (Finalist)"
    ];

    body.innerHTML = `
      <!-- Candidate Profile Banner -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface-subtle); border:1px solid var(--border-light); border-radius:12px; padding:1.25rem 1.5rem; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
        <div style="display:flex; align-items:center; gap:1.25rem;">
          <div style="width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); color:#FFFFFF; font-size:1.5rem; font-weight:700; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm);">
            ${student.avatar || student.name.slice(0,2).toUpperCase()}
          </div>
          <div>
            <h2 style="font-size:1.35rem; margin:0 0 0.25rem; color:var(--text-primary); font-weight:700;">${student.name}</h2>
            <div style="font-size:0.85rem; color:var(--text-secondary);">
              ${student.department} • ${student.year || '4th Year'} • <span style="font-family:var(--font-mono); font-weight:600; color:var(--primary);">${student.studentId}</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">${student.email}</div>
          </div>
        </div>

        <div style="text-align:right;">
          <span class="badge badge-success" style="font-size:0.82rem; margin-bottom:0.35rem; display:inline-block;">
            ✅ Verified Quantum Candidate
          </span>
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Highest Honor</div>
          <div style="font-size:1rem; font-weight:700; color:var(--primary-deep);">${student.highestHonor || 'Quantum Certified Developer'}</div>
        </div>
      </div>

      <!-- 5 Metric Counters -->
      <div class="student-stats-row" style="margin-bottom:1.75rem;">
        <div class="student-stat-box">
          <div class="num" style="color:var(--primary);">${student.courses}</div>
          <div class="label">Courses Completed</div>
        </div>
        <div class="student-stat-box">
          <div class="num" style="color:var(--secondary);">${student.certificates}</div>
          <div class="label">Certificates Earned</div>
        </div>
        <div class="student-stat-box">
          <div class="num" style="color:var(--accent-teal);">${student.projects}</div>
          <div class="label">Research Projects</div>
        </div>
        <div class="student-stat-box">
          <div class="num" style="color:var(--accent-cyan);">${student.researchPapers}</div>
          <div class="label">Papers Published</div>
        </div>
        <div class="student-stat-box">
          <div class="num" style="color:#F59E0B;">🏆 ${student.hackathons || 0}</div>
          <div class="label">Hackathons Won / Participated</div>
        </div>
      </div>

      <!-- Skills & Hackathons Badges -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.5rem;">
        <div>
          <div style="font-size:0.85rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.5rem; text-transform:uppercase;">Quantum Skill Set</div>
          <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
            ${(student.skills || ["Qiskit", "Python", "Quantum Algorithms"]).map(s => `<span class="badge badge-primary">${s}</span>`).join("")}
          </div>
        </div>

        <div>
          <div style="font-size:0.85rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.5rem; text-transform:uppercase;">Hackathons & Competitions</div>
          <div style="display:flex; flex-direction:column; gap:0.35rem;">
            ${hackathonsList.map(h => `<div style="font-size:0.82rem; background:var(--bg-surface-subtle); padding:0.35rem 0.6rem; border-radius:6px; border:1px solid var(--border-light);">🏆 <strong>${h}</strong></div>`).join("")}
          </div>
        </div>
      </div>

      <!-- Two Columns: Completed Courses & Timeline -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
        <!-- Completed Courses -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <h4 style="margin:0; font-size:1rem; font-weight:700; color:var(--text-primary);">Verified Completed Courses</h4>
            <span class="badge badge-success" style="font-size:0.72rem;">${completions.length} Completed</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            ${completions.map(c => `
              <div style="padding:0.85rem 1rem; background:var(--bg-surface-subtle); border:1px solid var(--border-light); border-radius:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                  <strong style="color:var(--text-primary); font-size:0.88rem;">${c.name}</strong>
                  <span class="badge badge-success" style="font-size:0.7rem;">Verified</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--text-secondary); margin-top:0.25rem;">
                  <span>Platform: <strong>${c.platform}</strong></span>
                  <span>Distinction: <strong style="color:var(--primary);">${c.grade || 'Certified'}</strong></span>
                </div>
                <div style="font-family:var(--font-mono); font-size:0.7rem; color:var(--text-muted); margin-top:0.25rem;">
                  ID: ${c.credentialId || 'QHUB-VERIFIED'} • Date: ${c.date || '2026'}
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Milestones Trajectory Timeline -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <h4 style="margin:0; font-size:1rem; font-weight:700; color:var(--text-primary);">Achievement Milestones</h4>
            <span class="badge badge-secondary" style="font-size:0.72rem;">Trajectory</span>
          </div>
          <div class="timeline" style="margin-top:0.5rem;">
            ${timelineData.map(item => `
              <div class="timeline-item">
                <div class="timeline-dot completed"></div>
                <div class="timeline-content">
                  <div class="timeline-date">${item.year}</div>
                  <div class="timeline-title">${item.title}</div>
                  <div class="timeline-desc">${item.desc}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <div style="margin-top:1.5rem; text-align:right; border-top:1px solid var(--border-light); padding-top:1rem;">
        <button class="btn btn-outline" onclick="Q_APP.closeModals()">Close Portfolio</button>
        <button class="btn btn-primary" onclick="Q_APP.closeModals(); Q_APP.openEditStudentModal('${student.id}');">✏️ Edit Candidate Record</button>
      </div>
    `;

    modal.classList.add("open");
  },

  // Student CRUD Modals & Handlers
  openAddStudentModal() {
    const modal = document.getElementById("studentFormModal");
    const title = document.getElementById("studentModalTitle");
    const form = document.getElementById("studentForm");
    if (!modal || !form) return;

    title.textContent = "Add New Student Achievement Record";
    form.reset();
    document.getElementById("studentFormEditId").value = "";
    document.getElementById("stuHighestHonor").value = "IBM Certified Associate Developer";
    document.getElementById("stuHackathons").value = "2";
    modal.classList.add("open");
  },

  openEditStudentModal(studentId) {
    const student = Q_DB.getStudentById(studentId);
    if (!student) return;

    const modal = document.getElementById("studentFormModal");
    const title = document.getElementById("studentModalTitle");
    if (!modal) return;

    title.textContent = "Edit Student Achievement Record";
    document.getElementById("studentFormEditId").value = student.id;
    document.getElementById("stuName").value = student.name;
    document.getElementById("stuRoll").value = student.studentId;
    document.getElementById("stuDept").value = student.department;
    document.getElementById("stuYear").value = student.year;
    document.getElementById("stuEmail").value = student.email;
    document.getElementById("stuHighestHonor").value = student.highestHonor || "";
    document.getElementById("stuSkills").value = (student.skills || []).join(", ");
    document.getElementById("stuCourses").value = student.courses;
    document.getElementById("stuCerts").value = student.certificates;
    document.getElementById("stuProjects").value = student.projects;
    document.getElementById("stuPapers").value = student.researchPapers;
    document.getElementById("stuHackathons").value = student.hackathons || 0;

    modal.classList.add("open");
  },

  handleStudentFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById("studentFormEditId").value;
    const skillsRaw = document.getElementById("stuSkills").value;
    const skillsArray = skillsRaw.split(",").map(s => s.trim()).filter(Boolean);

    const studentData = {
      name: document.getElementById("stuName").value.trim(),
      studentId: document.getElementById("stuRoll").value.trim(),
      department: document.getElementById("stuDept").value.trim(),
      year: document.getElementById("stuYear").value.trim(),
      email: document.getElementById("stuEmail").value.trim(),
      highestHonor: document.getElementById("stuHighestHonor").value.trim(),
      skills: skillsArray.length ? skillsArray : ["Qiskit", "Python"],
      courses: parseInt(document.getElementById("stuCourses").value) || 0,
      certificates: parseInt(document.getElementById("stuCerts").value) || 0,
      projects: parseInt(document.getElementById("stuProjects").value) || 0,
      researchPapers: parseInt(document.getElementById("stuPapers").value) || 0,
      hackathons: parseInt(document.getElementById("stuHackathons").value) || 0
    };

    if (editId) {
      Q_DB.updateStudent(editId, studentData);
      alert("Student achievement record updated successfully!");
    } else {
      const added = Q_DB.addStudent(studentData);
      this.activeStudentId = added.id;
      alert("New student achievement record created and added to database!");
    }

    this.closeModals();
    this.renderAllViews();
    Q_CHARTS.initAllCharts();
  },

  deleteStudentRecord(studentId) {
    const student = Q_DB.getStudentById(studentId);
    if (!student) return;

    if (confirm(`Are you sure you want to delete ${student.name} (${student.studentId}) from the database?`)) {
      Q_DB.deleteStudent(studentId);
      this.renderAllViews();
      Q_CHARTS.initAllCharts();
      alert("Student record deleted from database.");
    }
  },

  // ---------------- 5. FACULTY DBMS DATA TABLE & ALL-FACULTY SHOWCASE ----------------
  renderFacultyDBMS(searchQuery = "") {
    const container = document.getElementById("facultyListContainer");
    if (!container) return;

    let facultyList = Q_DB.getFaculty();

    // Faculty aggregate stats
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    const totalCourses = facultyList.reduce((sum, f) => sum + (parseInt(f.coursesTaught) || 0), 0);
    const totalCerts = facultyList.reduce((sum, f) => sum + (parseInt(f.certificates) || 0), 0);
    const totalProjects = facultyList.reduce((sum, f) => sum + (parseInt(f.projectsMentored) || 0), 0);
    const totalPapers = facultyList.reduce((sum, f) => sum + (parseInt(f.researchPapers) || 0), 0);
    const totalPatents = facultyList.reduce((sum, f) => sum + (parseInt(f.patents) || 0), 0);

    setVal("aggFacultyCount", facultyList.length);
    setVal("aggFacultyCoursesCount", totalCourses);
    setVal("aggFacultyCertsCount", totalCerts);
    setVal("aggFacultyProjectsCount", totalProjects);
    setVal("aggFacultyPapersCount", totalPapers);
    setVal("aggFacultyPatentsCount", totalPatents);

    if (searchQuery && searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      facultyList = facultyList.filter(f => 
        f.name.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.department.toLowerCase().includes(q) ||
        (f.highestHonor && f.highestHonor.toLowerCase().includes(q)) ||
        (f.expertise && f.expertise.some(e => e.toLowerCase().includes(q)))
      );
    }

    container.innerHTML = `
      <div class="dbms-toolbar" style="flex-wrap:wrap; gap:1rem; margin-bottom:1rem;">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <h3 style="font-size:1.15rem; margin:0;">Faculty Quantum Research & Achievements (${facultyList.length})</h3>
          <span class="badge badge-secondary">Faculty DBMS Active</span>
        </div>
        
        <!-- Dedicated Faculty Real-Time Search Bar -->
        <div style="flex:1; min-width:280px; max-width:420px;">
          <input 
            type="text" 
            class="dbms-form-input" 
            placeholder="🔍 Search faculty, designation, expertise, honor..." 
            value="${searchQuery}" 
            oninput="Q_APP.renderFacultyDBMS(this.value)"
            style="padding-left:0.85rem; font-size:0.88rem;"
          >
        </div>

        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="Q_APP.openAddFacultyModal()">
            ➕ Add Faculty Record
          </button>
          <button class="btn btn-outline btn-sm" onclick="Q_DB.exportJSON()">
            📥 Export JSON
          </button>
        </div>
      </div>

      <div class="dbms-table-wrapper">
        <table class="dbms-table">
          <thead>
            <tr>
              <th>Faculty Member</th>
              <th>Department</th>
              <th>Highest Honor / Fellowship</th>
              <th style="text-align:center;">Courses Taught</th>
              <th style="text-align:center;">Certificates</th>
              <th style="text-align:center;">Projects Mentored</th>
              <th style="text-align:center;">Research Papers</th>
              <th style="text-align:center;">Patents</th>
              <th style="text-align:center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${facultyList.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align:center; padding:2.5rem; color:var(--text-muted);">
                  No faculty records found matching your search.
                </td>
              </tr>
            ` : facultyList.map(f => `
              <tr>
                <td>
                  <div class="dbms-user-cell">
                    <div class="dbms-user-avatar" style="background:linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%); color:#FFFFFF;">${f.avatar || f.name.slice(0,2).toUpperCase()}</div>
                    <div>
                      <strong style="color:var(--text-primary); font-size:0.92rem;">${f.name}</strong>
                      <div style="font-size:0.75rem; color:var(--text-muted);">${f.title} • ${f.email}</div>
                    </div>
                  </div>
                </td>
                <td><span style="font-size:0.82rem; color:var(--text-secondary);">${f.department}</span></td>
                <td>
                  <span class="badge badge-primary" style="font-size:0.76rem; font-weight:600;">
                    ${f.highestHonor || 'Quantum Research Fellow'}
                  </span>
                </td>
                <td style="text-align:center;"><strong style="color:var(--primary); font-size:0.95rem;">${f.coursesTaught}</strong></td>
                <td style="text-align:center;"><strong style="color:var(--secondary); font-size:0.95rem;">${f.certificates}</strong></td>
                <td style="text-align:center;"><strong style="color:var(--accent-teal); font-size:0.95rem;">${f.projectsMentored}</strong></td>
                <td style="text-align:center;"><strong style="color:var(--accent-cyan); font-size:0.95rem;">${f.researchPapers}</strong></td>
                <td style="text-align:center;"><strong style="color:#F59E0B; font-size:0.95rem;">${f.patents}</strong></td>
                <td style="text-align:center;">
                  <div class="dbms-actions-cell" style="justify-content:center;">
                    <button class="btn btn-outline btn-sm btn-icon" title="View Faculty Profile" onclick="Q_APP.openFacultyPortfolioModal('${f.id}')">
                      👁️ View Profile
                    </button>
                    <button class="btn btn-outline btn-sm btn-icon" title="Edit Record" onclick="Q_APP.openEditFacultyModal('${f.id}')">
                      ✏️ Edit
                    </button>
                    <button class="btn btn-danger btn-sm btn-icon" title="Delete Record" onclick="Q_APP.deleteFacultyRecord('${f.id}')">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  },

  // Faculty Full Profile Modal
  openFacultyPortfolioModal(facultyId) {
    const f = Q_DB.getFacultyById(facultyId);
    if (!f) return;

    const modal = document.getElementById("facultyPortfolioModal");
    const body = document.getElementById("facultyPortfolioBody");
    const title = document.getElementById("facultyPortfolioModalTitle");
    if (!modal || !body) return;

    if (title) title.textContent = `${f.name} • Faculty Quantum Research Profile`;

    body.innerHTML = `
      <!-- Faculty Header Banner -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface-subtle); border:1px solid var(--border-light); border-radius:12px; padding:1.25rem 1.5rem; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
        <div style="display:flex; align-items:center; gap:1.25rem;">
          <div style="width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%); color:#FFFFFF; font-size:1.5rem; font-weight:700; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm);">
            ${f.avatar || f.name.slice(0,2).toUpperCase()}
          </div>
          <div>
            <h2 style="font-size:1.35rem; margin:0 0 0.25rem; color:var(--text-primary); font-weight:700;">${f.name}</h2>
            <div style="font-size:0.85rem; color:var(--text-secondary); font-weight:600;">${f.title}</div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">${f.department} • ${f.email}</div>
          </div>
        </div>

        <div style="text-align:right;">
          <span class="badge badge-secondary" style="font-size:0.82rem; margin-bottom:0.35rem; display:inline-block;">
            Verified Faculty Mentor
          </span>
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Fellowship & Honor</div>
          <div style="font-size:1rem; font-weight:700; color:var(--secondary);">${f.highestHonor || 'Quantum Research Fellow'}</div>
        </div>
      </div>

      <!-- 5 Faculty Stat Cards -->
      <div class="student-stats-row" style="margin-bottom:1.75rem;">
        <div class="student-stat-box">
          <div class="num" style="color:var(--primary);">${f.coursesTaught}</div>
          <div class="label">Courses Taught / Completed</div>
        </div>
        <div class="student-stat-box">
          <div class="num" style="color:var(--secondary);">${f.certificates}</div>
          <div class="label">Accredited Certifications</div>
        </div>
        <div class="student-stat-box">
          <div class="num" style="color:var(--accent-teal);">${f.projectsMentored}</div>
          <div class="label">Projects Mentored</div>
        </div>
        <div class="student-stat-box">
          <div class="num" style="color:var(--accent-cyan);">${f.researchPapers}</div>
          <div class="label">Papers Published</div>
        </div>
        <div class="student-stat-box">
          <div class="num" style="color:#F59E0B;">${f.patents}</div>
          <div class="label">Patents Filed / Granted</div>
        </div>
      </div>

      <!-- Expertise & Global Collaborations -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
        <div>
          <h4 style="margin:0 0 0.5rem; font-size:0.95rem; font-weight:700; color:var(--text-primary);">Quantum Research Expertise</h4>
          <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
            ${(f.expertise || []).map(e => `<span class="badge badge-primary">${e}</span>`).join("")}
          </div>
        </div>

        <div>
          <h4 style="margin:0 0 0.5rem; font-size:0.95rem; font-weight:700; color:var(--text-primary);">Global Industry & Academic Alliances</h4>
          <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
            ${(f.collaborations || []).map(c => `<span class="badge badge-teal">${c}</span>`).join("")}
          </div>
        </div>
      </div>

      <div style="margin-top:1.5rem; text-align:right; border-top:1px solid var(--border-light); padding-top:1rem;">
        <button class="btn btn-outline" onclick="Q_APP.closeModals()">Close Profile</button>
        <button class="btn btn-secondary" onclick="Q_APP.closeModals(); Q_APP.openEditFacultyModal('${f.id}');">✏️ Edit Faculty Record</button>
      </div>
    `;

    modal.classList.add("open");
  },

  // Faculty CRUD Modals & Handlers
  openAddFacultyModal() {
    const modal = document.getElementById("facultyFormModal");
    const title = document.getElementById("facultyModalTitle");
    const form = document.getElementById("facultyForm");
    if (!modal || !form) return;

    title.textContent = "Add New Faculty Quantum Record";
    form.reset();
    document.getElementById("facultyFormEditId").value = "";
    document.getElementById("facHighestHonor").value = "IBM Quantum Educators Council Fellow";
    modal.classList.add("open");
  },

  openEditFacultyModal(facultyId) {
    const f = Q_DB.getFacultyById(facultyId);
    if (!f) return;

    const modal = document.getElementById("facultyFormModal");
    const title = document.getElementById("facultyModalTitle");
    if (!modal) return;

    title.textContent = "Edit Faculty Quantum Record";
    document.getElementById("facultyFormEditId").value = f.id;
    document.getElementById("facName").value = f.name;
    document.getElementById("facTitle").value = f.title;
    document.getElementById("facDept").value = f.department;
    document.getElementById("facEmail").value = f.email;
    document.getElementById("facHighestHonor").value = f.highestHonor || "";
    document.getElementById("facExpertise").value = (f.expertise || []).join(", ");
    document.getElementById("facCollabs").value = (f.collaborations || []).join(", ");
    document.getElementById("facCourses").value = f.coursesTaught;
    document.getElementById("facCerts").value = f.certificates;
    document.getElementById("facProjects").value = f.projectsMentored;
    document.getElementById("facPapers").value = f.researchPapers;
    document.getElementById("facPatents").value = f.patents;

    modal.classList.add("open");
  },

  handleFacultyFormSubmit(e) {
    e.preventDefault();
    const editId = document.getElementById("facultyFormEditId").value;
    const expRaw = document.getElementById("facExpertise").value;
    const collabsRaw = document.getElementById("facCollabs").value;

    const facultyData = {
      name: document.getElementById("facName").value.trim(),
      title: document.getElementById("facTitle").value.trim(),
      department: document.getElementById("facDept").value.trim(),
      email: document.getElementById("facEmail").value.trim(),
      highestHonor: document.getElementById("facHighestHonor").value.trim(),
      expertise: expRaw.split(",").map(s => s.trim()).filter(Boolean),
      collaborations: collabsRaw.split(",").map(s => s.trim()).filter(Boolean),
      coursesTaught: parseInt(document.getElementById("facCourses").value) || 0,
      certificates: parseInt(document.getElementById("facCerts").value) || 0,
      projectsMentored: parseInt(document.getElementById("facProjects").value) || 0,
      researchPapers: parseInt(document.getElementById("facPapers").value) || 0,
      patents: parseInt(document.getElementById("facPatents").value) || 0
    };

    if (editId) {
      Q_DB.updateFaculty(editId, facultyData);
      alert("Faculty record updated successfully!");
    } else {
      Q_DB.addFaculty(facultyData);
      alert("New faculty achievement record created and added to database!");
    }

    this.closeModals();
    this.renderAllViews();
    Q_CHARTS.initAllCharts();
  },

  deleteFacultyRecord(facultyId) {
    const f = Q_DB.getFacultyById(facultyId);
    if (!f) return;

    if (confirm(`Are you sure you want to delete ${f.name} from the database?`)) {
      Q_DB.deleteFaculty(facultyId);
      this.renderAllViews();
      Q_CHARTS.initAllCharts();
      alert("Faculty record deleted from database.");
    }
  },

  // ---------------- 6. PROJECTS SHOWCASE ----------------
  renderProjects(filter = "All") {
    const container = document.getElementById("projectsGrid");
    if (!container) return;

    const filtered = Q_DB.getProjects().filter(p => filter === "All" || p.category === filter || (p.technology && p.technology.includes(filter)));

    container.innerHTML = filtered.map(prj => `
      <div class="q-card project-card interactive">
        <div class="project-img-wrapper">
          <svg class="project-img-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <div style="position:absolute; top:12px; right:12px;">
            <span class="badge badge-primary">${prj.category}</span>
          </div>
        </div>

        <div class="project-title">${prj.title}</div>
        <div class="project-desc">${prj.description}</div>

        <div class="project-team-meta">
          <div><strong>Team:</strong> ${(prj.team || []).join(", ")}</div>
          <div><strong>Mentor:</strong> ${prj.mentor}</div>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:1.25rem;">
          ${(prj.technology || []).map(t => `<span class="badge badge-tech">${t}</span>`).join("")}
        </div>

        <div class="project-actions">
          <a href="${prj.github}" target="_blank" class="btn btn-outline btn-sm" style="flex:1;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            GitHub
          </a>
          <button class="btn btn-primary btn-sm" style="flex:1;" onclick="Q_APP.openProjectDemoModal('${prj.id}')">
            ⚡ Demo
          </button>
        </div>
      </div>
    `).join("");
  },

  openAddProjectModal() {
    const title = prompt("Enter Quantum Project Title:");
    if (!title) return;
    const team = prompt("Enter Team Members (comma-separated):", "Kundum Pravallika, Rahul Varma");
    const tech = prompt("Enter Technology Stack (comma-separated):", "Qiskit, Python, Quantum ML");
    const mentor = prompt("Enter Mentor Name:", "Dr. Elena Vance");
    const desc = prompt("Enter Project Description:", "Quantum computing algorithmic implementation.");

    Q_DB.addProject({
      title: title,
      team: team ? team.split(",").map(t=>t.trim()) : ["Student Team"],
      technology: tech ? tech.split(",").map(t=>t.trim()) : ["Qiskit", "Python"],
      mentor: mentor || "Dr. Elena Vance",
      category: "Quantum ML",
      description: desc || "Institutional research project."
    });

    this.renderProjects();
    this.renderStatsCounters();
    alert("Quantum project added successfully!");
  },

  openProjectDemoModal(prjId) {
    const prj = Q_DB.getProjects().find(p => p.id === prjId) || Q_DB.getProjects()[0];
    const modal = document.getElementById("projectDemoModal");
    const body = document.getElementById("projectDemoBody");
    if (!modal || !body) return;

    body.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
          <h3 style="font-size:1.3rem; color:var(--text-primary);">${prj.title}</h3>
          <span class="badge badge-success">Active Live Sandbox</span>
        </div>
        <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1.5rem;">${prj.description}</p>
        
        <div style="background:#0F172A; border-radius:8px; padding:1.25rem; font-family:monospace; color:#38BDF8; font-size:0.85rem; margin-bottom:1.5rem; line-height:1.6;">
          <div style="color:#94A3B8;"># Initializing Quantum Circuit Backend (IBMQ 127-Qubit Simulator)...</div>
          <div>from qiskit import QuantumCircuit, Aer, execute</div>
          <div>qc = QuantumCircuit(4, 4)</div>
          <div>qc.h([0, 1])</div>
          <div>qc.cx(0, 2); qc.cx(1, 3)</div>
          <div>qc.measure_all()</div>
          <div style="color:#4ADE80; margin-top:0.5rem;">>> Execution complete: 1024 shots. State Fidelity: 99.14%</div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.82rem; color:var(--text-muted);">Lead Researcher: ${(prj.team && prj.team[0]) || 'Student'}</span>
          <a href="${prj.github}" target="_blank" class="btn btn-outline btn-sm">Explore Codebase</a>
        </div>
      </div>
    `;

    modal.classList.add("open");
  },

  // ---------------- 7. CERTIFICATES GALLERY ----------------
  renderCertificates() {
    const container = document.getElementById("certificatesGrid");
    if (!container) return;

    container.innerHTML = Q_DB.getCertificates().map(cert => `
      <div class="q-card cert-card interactive">
        <div>
          <div class="cert-badge-row">
            <span class="badge badge-success">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              Verified
            </span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${cert.issueDate}</span>
          </div>
          <div class="cert-title">${cert.course}</div>
          <div class="cert-issuer">${cert.organization}</div>
          <div style="font-size:0.82rem; color:var(--text-secondary); margin-top:0.4rem;">Recipient: <strong>${cert.recipient}</strong></div>
          <div class="cert-credential-box">
            ID: <strong>${cert.credentialId}</strong><br>
            Score: <span style="color:var(--primary); font-weight:600;">${cert.grade}</span>
          </div>
        </div>

        <div class="cert-actions">
          <button class="btn btn-outline btn-sm" style="flex:1;" onclick="Q_CERT.viewCertificate('${cert.id}')">View</button>
          <button class="btn btn-primary btn-sm" style="flex:1;" onclick="Q_CERT.verifyCertificate('${cert.id}')">Verify</button>
          <button class="btn btn-ghost btn-sm" onclick="Q_CERT.viewCertificate('${cert.id}'); setTimeout(()=>Q_CERT.downloadCertificate(), 300);" title="Download Certificate">⬇️</button>
        </div>
      </div>
    `).join("");
  },

  // ---------------- 8. RESEARCH REPOSITORY ----------------
  renderResearch(areaFilter = "All") {
    const container = document.getElementById("researchPapersList");
    if (!container) return;

    const filtered = Q_DB.getResearch().filter(p => areaFilter === "All" || p.area.includes(areaFilter));

    container.innerHTML = filtered.map(paper => `
      <div class="q-card paper-card">
        <div class="paper-header">
          <div>
            <div class="paper-title">${paper.title}</div>
            <div class="paper-authors">Authors: <strong>${paper.authors}</strong></div>
            <div class="paper-venue-row">
              <span>🏛️ ${paper.journal}</span>
              <span>📅 ${paper.year}</span>
              <span class="badge badge-teal">${paper.area}</span>
            </div>
          </div>
          <span class="badge badge-primary">${paper.type}</span>
        </div>

        <div class="paper-abstract">${paper.abstract}</div>

        <div class="paper-keywords">
          ${(paper.keywords || []).map(k => `<span class="badge badge-tech">#${k}</span>`).join("")}
        </div>

        <div class="paper-footer">
          <span class="paper-doi">DOI: ${paper.doi}</span>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-outline btn-sm" onclick="Q_APP.openBibtexModal('${paper.id}')">Cite (BibTeX)</button>
            <button class="btn btn-primary btn-sm" onclick="Q_APP.openPaperModal('${paper.id}')">View Paper PDF</button>
          </div>
        </div>
      </div>
    `).join("");
  },

  openAddResearchModal() {
    const title = prompt("Enter Research Paper Title:");
    if (!title) return;
    const authors = prompt("Enter Authors:", "Dr. Elena Vance, Kundum Pravallika");
    const journal = prompt("Enter Journal/Conference Venue:", "IEEE Transactions on Quantum Engineering");
    const area = prompt("Enter Research Area:", "Quantum Chemistry");
    const abstract = prompt("Enter Paper Abstract:", "Research publication on quantum information science.");

    Q_DB.addResearch({
      title: title,
      authors: authors || "Institutional Quantum Researchers",
      journal: journal || "IEEE Transactions on Quantum Engineering",
      area: area || "Quantum Computing",
      abstract: abstract || "Abstract on quantum algorithms and simulation."
    });

    this.renderResearch();
    this.renderStatsCounters();
    alert("Research paper publication record added successfully!");
  },

  openBibtexModal(paperId) {
    const paper = Q_DB.getResearch().find(p => p.id === paperId);
    if (!paper) return;

    const modal = document.getElementById("bibtexModal");
    const body = document.getElementById("bibtexBody");
    if (!modal || !body) return;

    body.innerHTML = `
      <div>
        <h4 style="margin-bottom:0.75rem;">BibTeX Citation</h4>
        <textarea style="width:100%; height:180px; font-family:monospace; font-size:0.8rem; background:var(--bg-surface-subtle); border:1px solid var(--border-light); border-radius:6px; padding:0.85rem; color:var(--text-primary);" readonly id="bibtexTextarea">${paper.bibtex}</textarea>
        <div style="display:flex; justify-content:flex-end; margin-top:1rem;">
          <button class="btn btn-primary btn-sm" onclick="navigator.clipboard.writeText(document.getElementById('bibtexTextarea').value); alert('BibTeX copied to clipboard!');">Copy Citation</button>
        </div>
      </div>
    `;

    modal.classList.add("open");
  },

  openPaperModal(paperId) {
    const paper = Q_DB.getResearch().find(p => p.id === paperId);
    if (!paper) return;

    const modal = document.getElementById("paperPdfModal");
    const body = document.getElementById("paperPdfBody");
    if (!modal || !body) return;

    body.innerHTML = `
      <div style="border:1px solid var(--border-light); border-radius:8px; padding:2rem; background:#FFFFFF; text-align:center;">
        <span class="badge badge-primary" style="margin-bottom:1rem;">Peer-Reviewed Manuscript Preview</span>
        <h2 style="font-size:1.35rem; margin-bottom:0.5rem;">${paper.title}</h2>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.5rem;">${paper.authors} — <em>${paper.journal} (${paper.year})</em></p>
        
        <div style="text-align:left; background:var(--bg-surface-subtle); padding:1.25rem; border-radius:6px; font-size:0.88rem; line-height:1.6; margin-bottom:1.5rem;">
          <strong>Abstract:</strong><br>${paper.abstract}
        </div>
        
        <div style="display:flex; justify-content:center; gap:0.75rem;">
          <button class="btn btn-primary" onclick="alert('Downloading full peer-reviewed PDF...')">⬇️ Download Full PDF</button>
          <button class="btn btn-outline" onclick="Q_APP.openBibtexModal('${paper.id}')">Export Citation</button>
        </div>
      </div>
    `;

    modal.classList.add("open");
  },

  // ---------------- 9. ACHIEVERS SHOWCASE ----------------
  renderAchievers() {
    const container = document.getElementById("achieversGrid");
    if (!container) return;

    const students = Q_DB.getStudents();
    container.innerHTML = students.map(ach => `
      <div class="q-card achiever-card interactive">
        <div class="achiever-avatar">${ach.avatar}</div>
        <div class="achiever-name">${ach.name}</div>
        <div class="achiever-dept">${ach.department}</div>

        <div class="achiever-badges-row">
          ${(ach.badges || ["Quantum Learner"]).map(b => `<span class="badge badge-secondary">${b}</span>`).join("")}
        </div>

        <div class="achiever-metrics-strip">
          <div class="achiever-metric-item"><div class="num">${ach.courses}</div><div class="lbl">Courses</div></div>
          <div class="achiever-metric-item"><div class="num">${ach.certificates}</div><div class="lbl">Certs</div></div>
          <div class="achiever-metric-item"><div class="num">${ach.projects}</div><div class="lbl">Projects</div></div>
          <div class="achiever-metric-item"><div class="num">${ach.researchPapers}</div><div class="lbl">Papers</div></div>
        </div>

        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">Top Focus: <strong>${ach.topSkill || 'Quantum Computing'}</strong></div>

        <button class="btn btn-outline btn-sm" style="width:100%;" onclick="Q_APP.selectActiveStudent('${ach.id}'); Q_APP.switchView('student');">
          View Quantum Journey
        </button>
      </div>
    `).join("");
  },

  // ---------------- 10. EVENTS ----------------
  renderEvents() {
    const container = document.getElementById("eventsGrid");
    if (!container) return;

    const events = (Q_DB.getDB().events || []);
    container.innerHTML = events.map(evt => `
      <div class="q-card event-card interactive">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
            <div class="event-date-badge">
              <span class="event-date-month">${evt.date.month}</span>
              <span class="event-date-day">${evt.date.day}</span>
            </div>
            <span class="badge badge-${evt.badgeColor || 'primary'}">${evt.type}</span>
          </div>

          <h3 style="font-size:1.15rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">${evt.title}</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5; margin-bottom:1rem;">${evt.description}</p>
          
          <div style="font-size:0.8rem; color:var(--text-muted); display:flex; flex-direction:column; gap:0.25rem; margin-bottom:1.25rem;">
            <div>🎤 <strong>Speaker:</strong> ${evt.speaker}</div>
            <div>🏛️ <strong>Host:</strong> ${evt.organization}</div>
            <div>👥 <strong>Attendance:</strong> ${evt.participants}</div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-light); padding-top:1rem;">
          <span class="badge badge-teal">${evt.status}</span>
          <button class="btn btn-primary btn-sm" onclick="Q_APP.openEventRegisterModal('${evt.id}')">Register Now</button>
        </div>
      </div>
    `).join("");
  },

  openEventRegisterModal(evtId) {
    const events = Q_DB.getDB().events || [];
    const evt = events.find(e => e.id === evtId) || events[0];
    if (!evt) return;

    const modal = document.getElementById("eventRegModal");
    const body = document.getElementById("eventRegBody");
    if (!modal || !body) return;

    body.innerHTML = `
      <div>
        <span class="badge badge-primary" style="margin-bottom:0.5rem;">Institutional Registration</span>
        <h3 style="font-size:1.25rem; margin-bottom:0.5rem;">${evt.title}</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1.25rem;">${evt.date.month} ${evt.date.day}, ${evt.date.year} • ${evt.organization}</p>
        
        <form onsubmit="event.preventDefault(); alert('Registration successful! Confirmation sent to your institutional email.'); Q_APP.closeModals();">
          <div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom:1.5rem;">
            <div>
              <label style="font-size:0.8rem; font-weight:600; color:var(--text-secondary);">Full Name</label>
              <input type="text" value="Quantum Researcher" required class="dbms-form-input">
            </div>
            <div>
              <label style="font-size:0.8rem; font-weight:600; color:var(--text-secondary);">Institutional Email</label>
              <input type="email" value="scholar@institution.edu" required class="dbms-form-input">
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;">Confirm Event Registration</button>
        </form>
      </div>
    `;

    modal.classList.add("open");
  },

  // ---------------- 11. INSTITUTIONAL QUANTUM READINESS ----------------
  renderReadiness() {
    const dimensions = [
      { name: "Student Training & Curriculum", score: 85, weight: "15%", description: "Active learners across specialized quantum courses with accredited credits." },
      { name: "Faculty Quantum Upskilling", score: 80, weight: "15%", description: "Faculty members certified in Qiskit, Cirq, and PQC pedagogical frameworks." },
      { name: "Course Completion & Retention", score: 88, weight: "15%", description: "Aggregate course completion with verified hands-on lab submissions." },
      { name: "Accredited Certifications", score: 75, weight: "15%", description: "Industry-recognized certificates (IBM, MIT xPRO, IEEE, CERN)." },
      { name: "Active Quantum Projects", score: 82, weight: "10%", description: "Open-source research and engineering repositories with active CI/CD." },
      { name: "Peer-Reviewed Research Papers", score: 70, weight: "15%", description: "Publications in IEEE TQE, PhysRev A, ACM TOPS, and Quantum Science." },
      { name: "Events, Hackathons & Seminars", score: 84, weight: "10%", description: "Institutional events, annual hackathons, and international workshops." },
      { name: "Industry & Global Alliances", score: 65, weight: "5%", description: "Active collaboration with IBM Quantum Hub, Xanadu, and NIST PQC consortia." }
    ];

    const scoreEl = document.getElementById("readinessBigScore");
    if (scoreEl) scoreEl.textContent = "78%";

    const dimContainer = document.getElementById("readinessDimensionsList");
    if (dimContainer) {
      dimContainer.innerHTML = dimensions.map(dim => `
        <div class="readiness-dim-item">
          <div class="dim-header">
            <span>${dim.name} (${dim.weight})</span>
            <span style="color:var(--primary); font-family:var(--font-mono);">${dim.score}%</span>
          </div>
          <div class="dim-bar" style="margin-bottom:0.4rem;">
            <div class="dim-fill" style="width:${dim.score}%;"></div>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${dim.description}</div>
        </div>
      `).join("");
    }
  },

  closeModals() {
    document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("open"));
  }
};

// Global App bootstrap
document.addEventListener("DOMContentLoaded", () => {
  Q_APP.init();
});
