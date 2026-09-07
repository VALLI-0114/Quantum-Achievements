/**
 * Q-HUB Analytics & Visual Charts Engine
 * Light Theme Chart.js configurations with dynamic DBMS integration.
 */

const Q_CHARTS = {
  instances: {},

  getDefaultOptions(type = "line") {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: type === "doughnut" || type === "pie",
          position: "bottom",
          labels: {
            font: { family: "'Inter', sans-serif", size: 12, weight: "500" },
            color: "#475569",
            padding: 16,
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: "#0F172A",
          titleFont: { family: "'Poppins', sans-serif", size: 13, weight: "600" },
          bodyFont: { family: "'Inter', sans-serif", size: 12 },
          padding: 12,
          cornerRadius: 8,
          boxPadding: 4,
          usePointStyle: true
        }
      },
      scales: type === "doughnut" || type === "pie" || type === "radar" ? {} : {
        x: {
          grid: { color: "#F1F5F9", drawBorder: false },
          ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: "#64748B" }
        },
        y: {
          grid: { color: "#F1F5F9", drawBorder: false },
          ticks: { font: { family: "'Inter', sans-serif", size: 11 }, color: "#64748B" }
        }
      }
    };
  },

  initAllCharts() {
    this.renderStudentCompletion();
    this.renderParticipationDonut();
    this.renderCourseCompletionBars();
    this.renderProjectsByTech();
    this.renderResearchGrowth();
    this.renderReadinessRadar();
  },

  renderStudentCompletion() {
    const ctx = document.getElementById("studentCompletionChart");
    if (!ctx) return;
    if (this.instances.studentCompletion) this.instances.studentCompletion.destroy();

    const students = Q_DB.getStudents();
    const activeCount = 400 + students.length * 5;

    this.instances.studentCompletion = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        datasets: [{
          label: "Active Quantum Learners",
          data: [35, 60, 95, 140, 210, 260, 315, 360, 395, activeCount],
          borderColor: "#2563EB",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: "#2563EB",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: this.getDefaultOptions("line")
    });
  },

  renderParticipationDonut() {
    const ctx = document.getElementById("participationDonutChart");
    if (!ctx) return;
    if (this.instances.participationDonut) this.instances.participationDonut.destroy();

    const studentCount = Q_DB.getStudents().length;
    const facultyCount = Q_DB.getFaculty().length;

    this.instances.participationDonut = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Undergraduate Students", "Postgraduate / PhD", "Faculty Members", "Industry Researchers"],
        datasets: [{
          data: [studentCount * 12 + 45, 20, facultyCount * 4 + 8, 5],
          backgroundColor: ["#2563EB", "#7C3AED", "#0EA5E9", "#0D9488"],
          borderColor: "#FFFFFF",
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        ...this.getDefaultOptions("doughnut"),
        cutout: "70%"
      }
    });
  },

  renderCourseCompletionBars() {
    const ctx = document.getElementById("courseCompletionBarChart");
    if (!ctx) return;
    if (this.instances.courseCompletion) this.instances.courseCompletion.destroy();

    this.instances.courseCompletion = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Quantum Computing", "Quantum ML", "Quantum Cryptography", "Quantum Optimization", "Algorithms"],
        datasets: [{
          label: "Completion Rate (%)",
          data: [92, 84, 79, 81, 76],
          backgroundColor: "#4338CA",
          borderRadius: 6,
          barThickness: 18
        }]
      },
      options: {
        ...this.getDefaultOptions("bar"),
        indexAxis: "y",
        scales: {
          x: { max: 100, grid: { color: "#F1F5F9" } },
          y: { grid: { display: false } }
        }
      }
    });
  },

  renderProjectsByTech() {
    const ctx = document.getElementById("projectsByTechChart");
    if (!ctx) return;
    if (this.instances.projectsByTech) this.instances.projectsByTech.destroy();

    const projects = Q_DB.getProjects();
    const qiskitCount = projects.filter(p => p.technology && p.technology.includes("Qiskit")).length + 30;
    const qmlCount = projects.filter(p => p.category === "Quantum ML").length + 16;
    const cryptoCount = projects.filter(p => p.category === "Quantum Cryptography").length + 10;
    const optCount = projects.filter(p => p.category === "Quantum Optimization").length + 7;
    const algoCount = projects.filter(p => p.category === "Quantum Algorithms").length + 5;

    this.instances.projectsByTech = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Qiskit", "Quantum ML (PennyLane)", "Quantum Cryptography", "Quantum Optimization (QAOA)", "Cirq / Algorithms"],
        datasets: [{
          label: "Number of Projects",
          data: [qiskitCount, qmlCount, cryptoCount, optCount, algoCount],
          backgroundColor: ["#2563EB", "#7C3AED", "#0EA5E9", "#10B981", "#F59E0B"],
          borderRadius: 8,
          barThickness: 28
        }]
      },
      options: this.getDefaultOptions("bar")
    });
  },

  renderResearchGrowth() {
    const ctx = document.getElementById("researchGrowthChart");
    if (!ctx) return;
    if (this.instances.researchGrowth) this.instances.researchGrowth.destroy();

    const papersCount = 21 + Q_DB.getResearch().length;

    this.instances.researchGrowth = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["2023", "2024", "2025", "2026 (YTD)"],
        datasets: [{
          label: "Publications Published",
          data: [2, 6, 11, papersCount],
          borderColor: "#7C3AED",
          backgroundColor: "rgba(124, 58, 237, 0.1)",
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          pointBackgroundColor: "#7C3AED",
          pointRadius: 5
        }]
      },
      options: this.getDefaultOptions("line")
    });
  },

  renderReadinessRadar() {
    const ctx = document.getElementById("readinessRadarChart");
    if (!ctx) return;
    if (this.instances.readinessRadar) this.instances.readinessRadar.destroy();

    const labels = ["Training", "Faculty", "Retention", "Certs", "Projects", "Papers", "Events", "Alliances"];
    const scores = [85, 80, 88, 75, 82, 70, 84, 65];

    this.instances.readinessRadar = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [{
          label: "Institutional Readiness Score",
          data: scores,
          backgroundColor: "rgba(37, 99, 235, 0.15)",
          borderColor: "#2563EB",
          borderWidth: 2,
          pointBackgroundColor: "#2563EB",
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: 20, color: "#94A3B8" },
            grid: { color: "#E2E8F0" },
            angleLines: { color: "#E2E8F0" },
            pointLabels: {
              font: { family: "'Inter', sans-serif", size: 11, weight: "600" },
              color: "#475569"
            }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
};
