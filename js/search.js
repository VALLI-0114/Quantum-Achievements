/**
 * Q-HUB Global Categorized Search Engine
 * Real-time searchable index across DBMS records.
 */

const Q_SEARCH = {
  modalEl: null,
  inputEl: null,
  resultsEl: null,

  init() {
    this.modalEl = document.getElementById("searchModal");
    this.inputEl = document.getElementById("globalSearchInput");
    this.resultsEl = document.getElementById("searchResultsContainer");

    // Shortcut Ctrl+K or / to open search
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        this.open();
      } else if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        this.open();
      } else if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });

    if (this.inputEl) {
      this.inputEl.addEventListener("input", (e) => this.handleSearch(e.target.value));
    }
  },

  isOpen() {
    return this.modalEl && this.modalEl.classList.contains("open");
  },

  open(initialQuery = "") {
    if (!this.modalEl) return;
    this.modalEl.classList.add("open");
    if (this.inputEl) {
      this.inputEl.value = initialQuery;
      this.inputEl.focus();
      this.handleSearch(initialQuery);
    }
  },

  close() {
    if (!this.modalEl) return;
    this.modalEl.classList.remove("open");
  },

  handleSearch(query) {
    if (!this.resultsEl) return;
    const q = (query || "").trim().toLowerCase();

    if (!q) {
      this.resultsEl.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.88rem;">
          <p>Type to search across <strong>Students</strong>, <strong>Faculty</strong>, <strong>Courses</strong>, <strong>Projects</strong>, <strong>Certificates</strong>, <strong>Research</strong>, and <strong>Events</strong>.</p>
          <div style="display:flex; gap:0.5rem; justify-content:center; margin-top:1rem; flex-wrap:wrap;">
            <span class="badge badge-primary" style="cursor:pointer;" onclick="Q_SEARCH.inputEl.value='Qiskit'; Q_SEARCH.handleSearch('Qiskit');">Qiskit</span>
            <span class="badge badge-secondary" style="cursor:pointer;" onclick="Q_SEARCH.inputEl.value='Pravallika'; Q_SEARCH.handleSearch('Pravallika');">Pravallika</span>
            <span class="badge badge-teal" style="cursor:pointer;" onclick="Q_SEARCH.inputEl.value='VQE'; Q_SEARCH.handleSearch('VQE');">VQE</span>
            <span class="badge badge-cyan" style="cursor:pointer;" onclick="Q_SEARCH.inputEl.value='Cryptography'; Q_SEARCH.handleSearch('Cryptography');">Cryptography</span>
          </div>
        </div>
      `;
      return;
    }

    const results = {
      Students: [],
      Faculty: [],
      Courses: [],
      Projects: [],
      Certificates: [],
      Research: [],
      Events: []
    };

    // 1. Students
    Q_DB.getStudents().forEach(student => {
      if (student.name.toLowerCase().includes(q) || student.department.toLowerCase().includes(q) || (student.highestHonor && student.highestHonor.toLowerCase().includes(q))) {
        results.Students.push({
          title: student.name,
          subtitle: `${student.department} • ${student.studentId} • ${student.highestHonor || 'Quantum Scholar'}`,
          view: "student",
          action: () => Q_APP.openStudentPortfolioModal(student.id)
        });
      }
    });

    // 2. Faculty
    Q_DB.getFaculty().forEach(f => {
      if (f.name.toLowerCase().includes(q) || f.department.toLowerCase().includes(q) || (f.expertise && f.expertise.some(e => e.toLowerCase().includes(q)))) {
        results.Faculty.push({
          title: f.name,
          subtitle: `${f.title} • ${(f.expertise || []).join(", ")}`,
          view: "faculty",
          action: null
        });
      }
    });

    // 3. Courses
    Q_DB.getCourses().forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.level.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q)) {
        results.Courses.push({
          title: c.name,
          subtitle: `${c.level} • ${c.category} • ${c.platform}`,
          view: "courses",
          action: null
        });
      }
    });

    // 4. Projects
    Q_DB.getProjects().forEach(p => {
      if (p.title.toLowerCase().includes(q) || (p.technology && p.technology.some(t => t.toLowerCase().includes(q))) || p.mentor.toLowerCase().includes(q)) {
        results.Projects.push({
          title: p.title,
          subtitle: `Tech: ${(p.technology || []).join(", ")} • Mentor: ${p.mentor}`,
          view: "projects",
          action: null
        });
      }
    });

    // 5. Certificates
    Q_DB.getCertificates().forEach(cert => {
      if (cert.course.toLowerCase().includes(q) || cert.recipient.toLowerCase().includes(q) || cert.credentialId.toLowerCase().includes(q) || cert.organization.toLowerCase().includes(q)) {
        results.Certificates.push({
          title: cert.course,
          subtitle: `${cert.recipient} • ${cert.organization} (${cert.credentialId})`,
          view: "certificates",
          action: null
        });
      }
    });

    // 6. Research
    Q_DB.getResearch().forEach(paper => {
      if (paper.title.toLowerCase().includes(q) || paper.authors.toLowerCase().includes(q) || paper.area.toLowerCase().includes(q) || (paper.keywords && paper.keywords.some(k => k.toLowerCase().includes(q)))) {
        results.Research.push({
          title: paper.title,
          subtitle: `${paper.authors} • ${paper.journal} (${paper.year})`,
          view: "research",
          action: null
        });
      }
    });

    // 7. Events
    (Q_DB.getDB().events || []).forEach(evt => {
      if (evt.title.toLowerCase().includes(q) || evt.type.toLowerCase().includes(q) || evt.speaker.toLowerCase().includes(q)) {
        results.Events.push({
          title: evt.title,
          subtitle: `${evt.type} • ${evt.date.month} ${evt.date.day}, ${evt.date.year} • ${evt.speaker}`,
          view: "events",
          action: null
        });
      }
    });

    let html = "";
    let totalFound = 0;

    for (const [category, items] of Object.entries(results)) {
      if (items.length > 0) {
        totalFound += items.length;
        html += `
          <div class="search-category-group">
            <div class="search-cat-title">${category} (${items.length})</div>
        `;
        items.forEach((item, idx) => {
          html += `
            <div class="search-result-item" onclick="if(window.currentSearchActions && window.currentSearchActions['${category}_${idx}']){window.currentSearchActions['${category}_${idx}']();} Q_APP.switchView('${item.view}'); Q_SEARCH.close();">
              <div class="search-res-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <div class="search-res-info">
                <div class="search-res-title">${item.title}</div>
                <div class="search-res-sub">${item.subtitle}</div>
              </div>
            </div>
          `;
          if (!window.currentSearchActions) window.currentSearchActions = {};
          window.currentSearchActions[`${category}_${idx}`] = item.action;
        });
        html += `</div>`;
      }
    }

    if (totalFound === 0) {
      this.resultsEl.innerHTML = `
        <div style="padding: 2.5rem; text-align: center; color: var(--text-muted);">
          <p>No results found for "<strong>${query}</strong>".</p>
          <p style="font-size:0.8rem; margin-top:0.4rem;">Try searching for <em>Qiskit, Machine Learning, Pravallika, VQE</em> or <em>Hackathon</em>.</p>
        </div>
      `;
    } else {
      this.resultsEl.innerHTML = html;
    }
  }
};
