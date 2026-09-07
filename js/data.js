/**
 * Q-HUB Institutional Quantum DBMS Data Store
 * Persistent localStorage database engine focused purely on completed achievements.
 */

const Q_DEFAULT_SEED = {
  // Students Database
  students: [
    {
      id: "STU-001",
      name: "Kundum Pravallika",
      studentId: "QST-2024-8891",
      department: "Information Technology & Quantum Informatics",
      year: "4th Year Undergraduate",
      email: "pravallika.k@institution.edu",
      avatar: "KP",
      highestHonor: "IBM Certified Associate Developer",
      courses: 8,
      certificates: 5,
      projects: 3,
      researchPapers: 2,
      hackathons: 3,
      hackathonsList: ["IBM Quantum Challenge (Finalist)", "MIT iQuHACK 2026 (Winner)", "Annual University Q-Hack (1st Place)"],
      eventsAttended: 12,
      topSkill: "Qiskit & QML",
      badges: ["Quantum Developer", "Quantum Researcher", "Top Performer"],
      skills: ["Qiskit", "Python", "Quantum Algorithms", "Quantum Machine Learning", "PennyLane", "Variational Quantum Circuits"],
      completedCoursesList: [
        { name: "QC-101: Quantum Computing Foundations", platform: "Q-HUB Academy", credentialId: "QHUB-QCF-2025", date: "Jan 2025", grade: "Distinction" },
        { name: "QC-102: Qiskit Developer Fundamentals", platform: "IBM Quantum", credentialId: "QIS-DEV-99412-KP", date: "Mar 2025", grade: "94% (Certified)" },
        { name: "QC-201: Quantum Machine Learning with PennyLane", platform: "Xanadu PennyLane", credentialId: "XAN-QML-8812", date: "Nov 2025", grade: "Honors" },
        { name: "QC-301: Quantum Optimization with QAOA & VQE", platform: "Q-HUB Academy", credentialId: "QHUB-OPT-2026", date: "Feb 2026", grade: "Exemplary" }
      ],
      timeline: [
        { year: "2025 (Q1)", title: "First Quantum Course Completed", desc: "Completed 'Fundamentals of Quantum Information & Linear Algebra' with distinction." },
        { year: "2025 (Q3)", title: "IBM Quantum Challenge Finalist", desc: "Designed an optimized QAOA circuit for Max-Cut graph partitioning problem." },
        { year: "2026 (Q1)", title: "IBM Certified Associate Qiskit Developer", desc: "Scored 94% on credential exam. Official Credential ID: QIS-DEV-99412-KP." },
        { year: "2026 (Q2)", title: "Quantum Project: Hybrid QNN for Medical Imaging", desc: "Led a 4-member student team to develop parameterized quantum classifiers for tumor detection." },
        { year: "2026 (Q3)", title: "Research Publication in IEEE Trans. Quantum Eng.", desc: "Co-authored 'Noise-Resilient Quantum Error Mitigation in Near-Term NISQ Processors'." }
      ]
    },
    {
      id: "STU-002",
      name: "Rahul Varma",
      studentId: "QST-2024-7712",
      department: "Computer Science & Engg",
      year: "4th Year Undergraduate",
      email: "rahul.v@institution.edu",
      avatar: "RV",
      highestHonor: "IEEE Post-Quantum Cryptography Fellow",
      courses: 7,
      certificates: 4,
      projects: 4,
      researchPapers: 1,
      hackathons: 2,
      hackathonsList: ["NIST PQC Hackathon (Runner Up)", "Google Quantum AI Challenge"],
      eventsAttended: 9,
      topSkill: "Cirq & QAOA",
      badges: ["Quantum Developer", "Quantum Innovator"],
      skills: ["Cirq", "C++", "Quantum Optimization", "QAOA", "Python"],
      completedCoursesList: [
        { name: "QC-101: Quantum Computing Foundations", platform: "Q-HUB Academy", credentialId: "QHUB-QCF-7712", date: "Feb 2025", grade: "Distinction" },
        { name: "QC-202: Post-Quantum Cryptography & Security", platform: "MIT xPRO", credentialId: "IEEE-PQC-2026-RV", date: "Jan 2026", grade: "91%" },
        { name: "QC-302: Advanced Quantum Algorithms", platform: "edX / Harvard", credentialId: "EDX-QA-9011", date: "Apr 2026", grade: "Honors" }
      ],
      timeline: [
        { year: "2025 (Q2)", title: "Cirq Developer Track Completed", desc: "Built noisy simulation pipelines on Google Cirq framework." },
        { year: "2026 (Q1)", title: "Post-Quantum Cryptography Fellowship", desc: "Implemented CRYSTALS-Kyber key exchange on ARM Cortex microcontrollers." }
      ]
    },
    {
      id: "STU-003",
      name: "Ananya Sen",
      studentId: "QST-2023-4419",
      department: "Physics & Quantum Optics",
      year: "Postgraduate (M.Sc)",
      email: "ananya.s@institution.edu",
      avatar: "AS",
      highestHonor: "CERN QTI Optical Fellow",
      courses: 9,
      certificates: 6,
      projects: 2,
      researchPapers: 3,
      hackathons: 4,
      hackathonsList: ["CERN QTI Hackathon (1st Place)", "IEEE Quantum Week Hackathon (Top 3)", "QHack PennyLane Sprint (Finalist)"],
      eventsAttended: 14,
      topSkill: "Quantum Key Distribution",
      badges: ["Quantum Researcher", "Quantum Theorist"],
      skills: ["Quantum Optics", "QKD", "BB84 Protocol", "Mathematica", "Python"],
      completedCoursesList: [
        { name: "QC-101: Quantum Computing Foundations", platform: "Q-HUB Academy", credentialId: "QHUB-QCF-4419", date: "Nov 2024", grade: "Distinction" },
        { name: "QC-303: Quantum Error Correction", platform: "Q-HUB Academy", credentialId: "QHUB-QEC-4419", date: "Jun 2025", grade: "Honors" },
        { name: "CERN QTI Optical Circuit Design", platform: "CERN QTI", credentialId: "CERN-QTI-2025-AS", date: "Nov 2025", grade: "High Honors" }
      ],
      timeline: [
        { year: "2024 (Q4)", title: "Joined Quantum Photonics Lab", desc: "Setup polarization-entangled photon source for free-space QKD testbed." },
        { year: "2025 (Q4)", title: "CERN QTI Certificate", desc: "Certified in Optical Quantum Circuit Design and Bell State measurement." },
        { year: "2026 (Q2)", title: "Published in ACM TOPS", desc: "Co-authored paper on distributed quantum credentials and lattice signatures." }
      ]
    },
    {
      id: "STU-004",
      name: "Rohan Patel",
      studentId: "QST-2025-1102",
      department: "Electronics & Communication",
      year: "3rd Year Undergraduate",
      email: "rohan.p@institution.edu",
      avatar: "RP",
      highestHonor: "Quantum Hardware Fellow",
      courses: 6,
      certificates: 3,
      projects: 3,
      researchPapers: 1,
      hackathons: 2,
      hackathonsList: ["IBM Pulse Microwave Hackathon", "National Quantum Sprint 2025"],
      eventsAttended: 7,
      topSkill: "Superconducting Qubits",
      badges: ["Quantum Learner", "Hardware Fellow"],
      skills: ["Qiskit Pulse", "Microwave Control", "RF Electronics", "Python"],
      completedCoursesList: [
        { name: "QC-101: Quantum Computing Foundations", platform: "Q-HUB Academy", credentialId: "QHUB-QCF-1102", date: "Mar 2025", grade: "First Class" },
        { name: "Qiskit Pulse Control & Calibration", platform: "IBM Quantum", credentialId: "IBM-PLS-1102", date: "Sep 2025", grade: "Certified" }
      ],
      timeline: [
        { year: "2025 (Q3)", title: "Qiskit Pulse Calibration Lab", desc: "Calibrated X90 and SX single-qubit microwave drive pulses on IBM devices." }
      ]
    },
    {
      id: "STU-005",
      name: "Sneha Rao",
      studentId: "QST-2024-5582",
      department: "Mathematics & Computing",
      year: "4th Year Undergraduate",
      email: "sneha.r@institution.edu",
      avatar: "SR",
      highestHonor: "Quantum Optimization Innovator",
      courses: 7,
      certificates: 4,
      projects: 3,
      researchPapers: 2,
      hackathons: 3,
      hackathonsList: ["Qiskit Fall Fest 2025 (Winner)", "Quantum Algorithms Open Challenge"],
      eventsAttended: 11,
      topSkill: "Quantum Optimization",
      badges: ["Quantum Innovator", "Quantum Developer"],
      skills: ["QAOA", "QUBO Formulations", "Ising Models", "Python", "Gurobi"],
      completedCoursesList: [
        { name: "QC-101: Quantum Computing Foundations", platform: "Q-HUB Academy", credentialId: "QHUB-QCF-5582", date: "Jan 2025", grade: "Distinction" },
        { name: "QC-301: Quantum Optimization with QAOA", platform: "Q-HUB Academy", credentialId: "QHUB-OPT-5582", date: "May 2025", grade: "Exemplary" }
      ],
      timeline: [
        { year: "2025 (Q2)", title: "Smart Grid Optimizer Released", desc: "Published open-source QAOA power grid distribution library." },
        { year: "2025 (Q4)", title: "Paper in Quantum Science & Tech", desc: "Published findings on heavy-hex graph optimization." }
      ]
    },
    {
      id: "STU-006",
      name: "Amitabh Sen",
      studentId: "QST-2026-9901",
      department: "Quantum Machine Learning",
      year: "Postgraduate (M.Tech)",
      email: "amitabh.s@institution.edu",
      avatar: "AS",
      highestHonor: "PennyLane QML Specialist",
      courses: 6,
      certificates: 4,
      projects: 2,
      researchPapers: 1,
      hackathons: 2,
      hackathonsList: ["MIT iQuHACK 2025", "IBM Quantum Spring Challenge"],
      eventsAttended: 8,
      topSkill: "PennyLane & QNN",
      badges: ["Quantum Developer"],
      skills: ["PennyLane", "PyTorch", "Quantum Kernels", "Python"],
      completedCoursesList: [
        { name: "QC-101: Quantum Computing Foundations", platform: "Q-HUB Academy", credentialId: "QHUB-QCF-9901", date: "Jan 2026", grade: "Distinction" },
        { name: "QC-201: Quantum Machine Learning", platform: "Xanadu PennyLane", credentialId: "XAN-QML-9901", date: "May 2026", grade: "Honors" }
      ],
      timeline: [
        { year: "2026 (Q1)", title: "Quantum Kernel Classifier Built", desc: "Engineered high-dimensional quantum kernel SVM for fraud detection." }
      ]
    }
  ],

  // Faculty Database
  faculty: [
    {
      id: "FAC-001",
      name: "Dr. Elena Vance",
      facultyId: "FAC-QNT-01",
      title: "Professor & Director of Quantum Research Center",
      department: "Quantum Information & Applied Physics",
      email: "e.vance@institution.edu",
      avatar: "EV",
      highestHonor: "IBM Quantum Educators Council Master Fellow",
      coursesTaught: 12,
      certificates: 8,
      projectsMentored: 24,
      researchPapers: 38,
      patents: 4,
      studentsMentored: 24,
      collaborations: ["IBM Quantum Network", "MIT Center for Theoretical Physics", "CERN QTI"],
      expertise: ["Quantum Error Correction", "NISQ Algorithms", "Topological Quantum Computing", "VQE"],
      recentPapers: [
        "Scalable Surface Codes on Heavy-Hex Architectures (2026)",
        "Variational Quantum Benchmarks in Chemical Catalysis (2025)"
      ]
    },
    {
      id: "FAC-002",
      name: "Dr. Rajesh Sharma",
      facultyId: "FAC-CS-02",
      title: "Associate Professor, Department of Computer Science",
      department: "Computer Science & Cryptography",
      email: "r.sharma@institution.edu",
      avatar: "RS",
      highestHonor: "NIST PQC Committee Research Advisor",
      coursesTaught: 9,
      certificates: 6,
      projectsMentored: 18,
      researchPapers: 22,
      patents: 2,
      studentsMentored: 18,
      collaborations: ["IEEE Quantum Initiative", "NIST Post-Quantum Cryptography WG"],
      expertise: ["Post-Quantum Cryptography", "Quantum Key Distribution", "Quantum Complexity Theory", "Lattice Cryptography"],
      recentPapers: [
        "Lattice-based Signatures under Side-Channel Quantum Threats (2026)",
        "Quantum Walk Architectures for Decentralized Consensus (2025)"
      ]
    },
    {
      id: "FAC-003",
      name: "Dr. Marcus Lin",
      facultyId: "FAC-AI-03",
      title: "Assistant Professor, AI & Quantum Systems",
      department: "Data Science & Machine Learning",
      email: "m.lin@institution.edu",
      avatar: "ML",
      highestHonor: "PennyLane Xanadu Hub Lead Investigator",
      coursesTaught: 7,
      certificates: 5,
      projectsMentored: 14,
      researchPapers: 16,
      patents: 1,
      studentsMentored: 14,
      collaborations: ["PennyLane Xanadu Hub", "Google Quantum AI Academic Alliance"],
      expertise: ["Quantum Neural Networks", "Barren Plateaus Mitigation", "Quantum Generative Models", "PennyLane"],
      recentPapers: [
        "Mitigating Barren Plateaus in Quantum Convolutional Networks (2026)"
      ]
    }
  ],

  // Completed Course Records Catalog
  courses: [
    {
      id: "CRS-001",
      name: "Introduction to Quantum Computing & Qubits",
      level: "Beginner",
      category: "Quantum Computing",
      duration: "8 Weeks",
      platform: "Q-HUB Academy",
      enrolled: 420,
      faculty: "Dr. Elena Vance",
      description: "Foundational concepts: superposition, entanglement, quantum gates (H, X, Y, Z, CNOT), and simple algorithms."
    },
    {
      id: "CRS-002",
      name: "Qiskit Developer Fundamentals",
      level: "Beginner",
      category: "Quantum Computing",
      duration: "6 Weeks",
      platform: "IBM Quantum",
      enrolled: 380,
      faculty: "Dr. Elena Vance",
      description: "Hands-on programming with Qiskit SDK: circuit composition, transpilation, running on IBM Quantum real backends."
    },
    {
      id: "CRS-003",
      name: "Quantum Machine Learning with PennyLane",
      level: "Intermediate",
      category: "Quantum ML",
      duration: "10 Weeks",
      platform: "Xanadu PennyLane",
      enrolled: 290,
      faculty: "Dr. Marcus Lin",
      description: "Variational quantum circuits, parameter shift rules, quantum classifiers, and hybrid quantum-classical neural networks."
    },
    {
      id: "CRS-004",
      name: "Post-Quantum Cryptography & Security",
      level: "Advanced",
      category: "Quantum Cryptography",
      duration: "12 Weeks",
      platform: "MIT xPRO",
      enrolled: 185,
      faculty: "Dr. Rajesh Sharma",
      description: "Shor's algorithm threat, lattice-based cryptography (Kyber, Dilithium), hash-based signatures, and quantum key distribution."
    },
    {
      id: "CRS-005",
      name: "Quantum Optimization with QAOA & VQE",
      level: "Intermediate",
      category: "Quantum Optimization",
      duration: "8 Weeks",
      platform: "Q-HUB Academy",
      enrolled: 240,
      faculty: "Dr. Elena Vance",
      description: "Combinatorial problems as Ising Hamiltonians, Max-Cut, TSP, and portfolio optimization via QAOA and VQE."
    },
    {
      id: "CRS-006",
      name: "Advanced Quantum Algorithms & Complexity",
      level: "Advanced",
      category: "Quantum Algorithms",
      duration: "12 Weeks",
      platform: "edX / Harvard",
      enrolled: 160,
      faculty: "Dr. Rajesh Sharma",
      description: "Quantum Phase Estimation, HHL algorithm for linear systems, Quantum Fourier Transform, and BQP complexity."
    }
  ],

  // Projects Database
  projects: [
    {
      id: "PRJ-001",
      title: "Variational Quantum Classifier for Healthcare Diagnostics",
      team: ["Kundum Pravallika (Lead)", "Rahul Varma", "Aditya Nair"],
      mentor: "Dr. Marcus Lin",
      technology: ["Qiskit", "Python", "Quantum ML", "PyTorch"],
      category: "Quantum ML",
      description: "A hybrid quantum-classical convolutional network utilizing angle embeddings to classify multi-class thoracic pathologies.",
      github: "https://github.com/q-hub-inst/vqc-healthcare",
      demo: "Live Simulator Ready"
    },
    {
      id: "PRJ-002",
      title: "Quantum Key Distribution (QKD) Simulator & BB84 Channel Analyzer",
      team: ["Ananya Sen (Lead)", "Rohan Patel"],
      mentor: "Dr. Rajesh Sharma",
      technology: ["Python", "Cirq", "Quantum Cryptography"],
      category: "Quantum Cryptography",
      description: "Simulation of BB84 and Decoy-State QKD over noisy atmospheric and fiber channels with real-time eavesdropper detection.",
      github: "https://github.com/q-hub-inst/qkd-bb84-sim",
      demo: "Interactive Testbed"
    },
    {
      id: "PRJ-003",
      title: "QAOA-Driven Smart Grid Energy Load Balancer",
      team: ["Sneha Rao (Lead)", "Kundum Pravallika"],
      mentor: "Dr. Elena Vance",
      technology: ["Qiskit", "Python", "Quantum Optimization"],
      category: "Quantum Optimization",
      description: "Ising Hamiltonian mapping for optimal microgrid distribution and peak-shaving, outperforming classical annealing by 14%.",
      github: "https://github.com/q-hub-inst/qaoa-grid-balance",
      demo: "Energy Optimizer"
    },
    {
      id: "PRJ-004",
      title: "Fault-Tolerant Surface Code Syndrome Decoder via Tensor Networks",
      team: ["Rohan Patel (Lead)", "Ananya Sen"],
      mentor: "Dr. Elena Vance",
      technology: ["Qiskit", "TensorFlow Quantum", "Quantum Algorithms"],
      category: "Quantum Algorithms",
      description: "Real-time syndrome extraction and minimum-weight perfect matching (MWPM) decoder for distance-3 and distance-5 rotated surface code geometries.",
      github: "https://github.com/q-hub-inst/surface-code-decoder",
      demo: "Syndrome Visualizer"
    }
  ],

  // Certificates Database
  certificates: [
    {
      id: "CERT-001",
      recipient: "Kundum Pravallika",
      course: "IBM Certified Associate Developer - Quantum Computation using Qiskit v0.2x",
      organization: "IBM Quantum",
      issueDate: "January 18, 2026",
      credentialId: "QIS-DEV-99412-KP",
      status: "Verified",
      grade: "94% (Distinction)",
      hash: "0x8f4d92a1c6e7b30f5d81aa4927cb09e25411c9f801"
    },
    {
      id: "CERT-002",
      recipient: "Kundum Pravallika",
      course: "Quantum Machine Learning & Parameterized Algorithms",
      organization: "Q-HUB Quantum Academy & MIT xPRO",
      issueDate: "December 04, 2025",
      credentialId: "QHUB-QML-2025-KP",
      status: "Verified",
      grade: "Exemplary",
      hash: "0x3a7e58c91d4b60f2a9e87123cd56ef98201a4bc762"
    },
    {
      id: "CERT-003",
      recipient: "Rahul Varma",
      course: "Post-Quantum Cryptography & Lattice-Based Key Exchange",
      organization: "IEEE Quantum Initiative",
      issueDate: "February 12, 2026",
      credentialId: "IEEE-PQC-2026-RV",
      status: "Verified",
      grade: "91%",
      hash: "0x6b29cf104e7381ad54c0e9812fba490198de374291"
    },
    {
      id: "CERT-004",
      recipient: "Ananya Sen",
      course: "Quantum Optical Circuits & QKD Protocol Engineering",
      organization: "CERN Quantum Technology Initiative",
      issueDate: "November 28, 2025",
      credentialId: "CERN-QTI-2025-AS",
      status: "Verified",
      grade: "High Honors",
      hash: "0x12ef45ab890cde671234567890abcdef1234567890"
    },
    {
      id: "CERT-005",
      recipient: "Dr. Elena Vance (Faculty)",
      course: "Master Instructor: Quantum Error Correction & Scalable Hardware",
      organization: "IBM Quantum Educators Council",
      issueDate: "August 15, 2025",
      credentialId: "IBM-EDU-FAC-EV-01",
      status: "Verified",
      grade: "Distinguished Fellow",
      hash: "0x98fe76dc54ba3210fedcba0987654321fedcba0987"
    }
  ],

  // Research Publications Database
  researchPapers: [
    {
      id: "PUB-001",
      title: "Noise-Resilient Variational Quantum Eigensolver for Catalytic Intermediate Calculations",
      authors: "Dr. Elena Vance, Kundum Pravallika, Dr. Marcus Lin",
      journal: "IEEE Transactions on Quantum Engineering",
      year: 2026,
      area: "Quantum Chemistry",
      doi: "10.1109/TQE.2026.3389104",
      type: "Journal Article",
      abstract: "We introduce a zero-noise extrapolation (ZNE) protocol combined with symmetry-conserving qubit excitation operators to compute the potential energy surface of transition metal catalysts on 16-qubit IBM superconducting processors.",
      keywords: ["VQE", "Error Mitigation", "Quantum Chemistry", "NISQ"],
      bibtex: `@article{vance2026noiseresilient,\n  author = {Vance, Elena and Pravallika, Kundum and Lin, Marcus},\n  title = {Noise-Resilient Variational Quantum Eigensolver for Catalytic Intermediate Calculations},\n  journal = {IEEE Transactions on Quantum Engineering},\n  volume = {7},\n  pages = {112--124},\n  year = {2026},\n  doi = {10.1109/TQE.2026.3389104}\n}`
    },
    {
      id: "PUB-002",
      title: "Post-Quantum Hybrid Lattice Cryptosystems for Distributed Academic Credentials",
      authors: "Dr. Rajesh Sharma, Ananya Sen, Rahul Varma",
      journal: "ACM Transactions on Privacy and Security (TOPS)",
      year: 2026,
      area: "Cryptography",
      doi: "10.1145/3641209.2026",
      type: "Journal Article",
      abstract: "This paper designs a zero-knowledge verifiable credential architecture employing Module-LWE lattice signatures (CRYSTALS-Dilithium) to ensure quantum-resistant tamper-proofing across multi-institutional university portals.",
      keywords: ["Post-Quantum Cryptography", "Lattice Cryptography", "Dilithium"],
      bibtex: `@article{sharma2026pqc,\n  author = {Sharma, Rajesh and Sen, Ananya and Varma, Rahul},\n  title = {Post-Quantum Hybrid Lattice Cryptosystems for Distributed Academic Credentials},\n  journal = {ACM Trans. Priv. Sec.},\n  year = {2026},\n  doi = {10.1145/3641209.2026}\n}`
    },
    {
      id: "PUB-003",
      title: "Mitigating Barren Plateaus in Quantum Convolutional Neural Networks via Local Cost Operators",
      authors: "Dr. Marcus Lin, Kundum Pravallika, Aditya Nair",
      journal: "Physical Review A / Quantum Information",
      year: 2025,
      area: "Quantum Machine Learning",
      doi: "10.1103/PhysRevA.109.042415",
      type: "Journal Article",
      abstract: "We prove analytically and demonstrate numerically that shallow quantum convolutional ansatzes equipped with local observable observables escape exponentially vanishing gradients.",
      keywords: ["Barren Plateaus", "Quantum Neural Networks", "PennyLane"],
      bibtex: `@article{lin2025barren,\n  author = {Lin, Marcus and Pravallika, Kundum and Nair, Aditya},\n  title = {Mitigating Barren Plateaus in Quantum Convolutional Neural Networks},\n  journal = {Phys. Rev. A},\n  volume = {109},\n  year = {2025},\n  doi = {10.1103/PhysRevA.109.042415}\n}`
    }
  ],

  // Events Database
  events: [
    {
      id: "EVT-001",
      title: "Annual University Quantum Hackathon 2026",
      type: "Hackathon",
      date: { month: "OCT", day: "24-26", year: "2026" },
      speaker: "Keynote by Dr. Jay Gambetta (IBM Fellow)",
      organization: "Q-HUB in partnership with IBM Quantum",
      participants: "280 Registered (48 Teams)",
      status: "Registration Open",
      badgeColor: "primary",
      description: "A 48-hour competitive sprint solving challenges across Quantum ML, PQC Migration, and Quantum Chemistry optimization on real 127-qubit QPUs."
    },
    {
      id: "EVT-002",
      title: "Hands-on Workshop: Variational Quantum Algorithms with PennyLane",
      type: "Workshop",
      date: { month: "NOV", day: "12", year: "2026" },
      speaker: "Dr. Maria Schuld (Xanadu AI)",
      organization: "Department of IT & Quantum Center",
      participants: "120 Participants",
      status: "Seats Available",
      badgeColor: "teal",
      description: "Interactive laboratory session on training QNNs, barren plateau mitigation, and hybrid PyTorch model deployment."
    }
  ]
};

// Reactive DBMS Engine with LocalStorage
const Q_DB = {
  STORAGE_KEY: "qhub_institutional_db_v7_faculty_first",

  getDB() {
    try {
      // Clean up any old keys that stored outdated structures
      ["qhub_institutional_db_v1", "qhub_institutional_db_v2", "qhub_institutional_db_v3", "qhub_institutional_db_v4", "qhub_institutional_db_v5", "qhub_institutional_db_v6"].forEach(k => {
        try { localStorage.removeItem(k); } catch(e){}
      });
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to load DB from localStorage:", e);
    }
    return JSON.parse(JSON.stringify(Q_DEFAULT_SEED));
  },

  saveDB(db) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error("Failed to save DB to localStorage:", e);
    }
  },

  resetDB() {
    localStorage.removeItem(this.STORAGE_KEY);
    return this.getDB();
  },

  exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.getDB(), null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "qhub_institutional_database.json");
    dlAnchorElem.click();
  },

  // ---------------- STUDENTS CRUD ----------------
  getStudents() {
    return this.getDB().students || [];
  },

  getStudentById(id) {
    return this.getStudents().find(s => s.id === id || s.name === id);
  },

  addStudent(studentData) {
    const db = this.getDB();
    const newId = "STU-" + String(Date.now()).slice(-4);
    const initials = studentData.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    
    const newStudent = {
      id: newId,
      name: studentData.name,
      studentId: studentData.studentId || `QST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      department: studentData.department || "Information Technology",
      year: studentData.year || "3rd Year Undergraduate",
      email: studentData.email || `${studentData.name.toLowerCase().replace(/\s+/g, '.')}@institution.edu`,
      avatar: initials || "QS",
      highestHonor: studentData.highestHonor || "Quantum Certified Scholar",
      courses: parseInt(studentData.courses) || 0,
      certificates: parseInt(studentData.certificates) || 0,
      projects: parseInt(studentData.projects) || 0,
      researchPapers: parseInt(studentData.researchPapers) || 0,
      hackathons: parseInt(studentData.hackathons) || 0,
      hackathonsList: studentData.hackathonsList || ["University Quantum Challenge Finalist"],
      eventsAttended: parseInt(studentData.eventsAttended) || 0,
      topSkill: studentData.topSkill || "Qiskit Developer",
      badges: studentData.badges && studentData.badges.length ? studentData.badges : ["Quantum Achiever"],
      skills: studentData.skills && studentData.skills.length ? studentData.skills : ["Qiskit", "Python", "Quantum Algorithms"],
      completedCoursesList: studentData.completedCoursesList || [
        { name: "QC-101: Quantum Computing Foundations", platform: "Q-HUB Academy", credentialId: `QHUB-${newId}`, date: "2026", grade: "Distinction" }
      ],
      timeline: studentData.timeline && studentData.timeline.length ? studentData.timeline : [
        { year: `${new Date().getFullYear()} (Q1)`, title: "Completed Quantum Track", desc: "Verified course completions and laboratory achievements." }
      ]
    };

    db.students.unshift(newStudent);
    this.saveDB(db);
    return newStudent;
  },

  updateStudent(id, studentData) {
    const db = this.getDB();
    const idx = db.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      db.students[idx] = { ...db.students[idx], ...studentData };
      this.saveDB(db);
      return db.students[idx];
    }
    return null;
  },

  deleteStudent(id) {
    const db = this.getDB();
    db.students = db.students.filter(s => s.id !== id);
    this.saveDB(db);
  },

  // ---------------- FACULTY CRUD ----------------
  getFaculty() {
    return this.getDB().faculty || [];
  },

  getFacultyById(id) {
    return this.getFaculty().find(f => f.id === id || f.name === id);
  },

  addFaculty(facultyData) {
    const db = this.getDB();
    const newId = "FAC-" + String(Date.now()).slice(-4);
    const initials = facultyData.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

    const newFaculty = {
      id: newId,
      name: facultyData.name,
      facultyId: facultyData.facultyId || `FAC-${Math.floor(100 + Math.random() * 900)}`,
      title: facultyData.title || "Professor",
      department: facultyData.department || "Quantum Computing & Information Sciences",
      email: facultyData.email || `${facultyData.name.toLowerCase().replace(/\s+/g, '.')}@institution.edu`,
      avatar: initials || "FP",
      highestHonor: facultyData.highestHonor || "Quantum Research Fellow",
      coursesTaught: parseInt(facultyData.coursesTaught) || 0,
      certificates: parseInt(facultyData.certificates) || 0,
      projectsMentored: parseInt(facultyData.projectsMentored) || 0,
      researchPapers: parseInt(facultyData.researchPapers) || 0,
      patents: parseInt(facultyData.patents) || 0,
      studentsMentored: parseInt(facultyData.studentsMentored) || 0,
      collaborations: facultyData.collaborations || ["Institutional Quantum Research Lab"],
      expertise: facultyData.expertise || ["Quantum Algorithms", "Quantum Computing"],
      recentPapers: facultyData.recentPapers || ["Quantum Pedagogical Frameworks (2026)"]
    };

    db.faculty.unshift(newFaculty);
    this.saveDB(db);
    return newFaculty;
  },

  updateFaculty(id, facultyData) {
    const db = this.getDB();
    const idx = db.faculty.findIndex(f => f.id === id);
    if (idx !== -1) {
      db.faculty[idx] = { ...db.faculty[idx], ...facultyData };
      this.saveDB(db);
      return db.faculty[idx];
    }
    return null;
  },

  deleteFaculty(id) {
    const db = this.getDB();
    db.faculty = db.faculty.filter(f => f.id !== id);
    this.saveDB(db);
  },

  // ---------------- COURSES ----------------
  getCourses() {
    return this.getDB().courses || [];
  },

  // ---------------- PROJECTS CRUD ----------------
  getProjects() {
    return this.getDB().projects || [];
  },

  addProject(prjData) {
    const db = this.getDB();
    const newId = "PRJ-" + String(Date.now()).slice(-4);
    const newPrj = {
      id: newId,
      title: prjData.title,
      team: Array.isArray(prjData.team) ? prjData.team : [prjData.team],
      mentor: prjData.mentor || "Dr. Elena Vance",
      technology: Array.isArray(prjData.technology) ? prjData.technology : [prjData.technology],
      category: prjData.category || "Quantum ML",
      description: prjData.description || "Quantum computing research project implementation.",
      github: prjData.github || "https://github.com/q-hub-inst",
      demo: prjData.demo || "Interactive Demo"
    };
    db.projects.unshift(newPrj);
    this.saveDB(db);
    return newPrj;
  },

  deleteProject(id) {
    const db = this.getDB();
    db.projects = db.projects.filter(p => p.id !== id);
    this.saveDB(db);
  },

  // ---------------- CERTIFICATES CRUD ----------------
  getCertificates() {
    return this.getDB().certificates || [];
  },

  addCertificate(certData) {
    const db = this.getDB();
    const newId = "CERT-" + String(Date.now()).slice(-4);
    const randomHash = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join("");
    const newCert = {
      id: newId,
      recipient: certData.recipient,
      course: certData.course,
      organization: certData.organization || "IBM Quantum",
      issueDate: certData.issueDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      credentialId: certData.credentialId || `QIS-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "Verified",
      grade: certData.grade || "Distinction (92%)",
      hash: randomHash
    };
    db.certificates.unshift(newCert);
    this.saveDB(db);
    return newCert;
  },

  deleteCertificate(id) {
    const db = this.getDB();
    db.certificates = db.certificates.filter(c => c.id !== id);
    this.saveDB(db);
  },

  // ---------------- RESEARCH PAPERS CRUD ----------------
  getResearch() {
    return this.getDB().researchPapers || [];
  },

  addResearch(paperData) {
    const db = this.getDB();
    const newId = "PUB-" + String(Date.now()).slice(-4);
    const newPaper = {
      id: newId,
      title: paperData.title,
      authors: paperData.authors,
      journal: paperData.journal || "IEEE Transactions on Quantum Engineering",
      year: parseInt(paperData.year) || new Date().getFullYear(),
      area: paperData.area || "Quantum Computing",
      doi: paperData.doi || `10.1109/TQE.${new Date().getFullYear()}.${Math.floor(100000 + Math.random()*900000)}`,
      type: paperData.type || "Journal Article",
      abstract: paperData.abstract || "Academic research publication on quantum computing and information science.",
      keywords: Array.isArray(paperData.keywords) ? paperData.keywords : [paperData.keywords || "Quantum"],
      bibtex: paperData.bibtex || `@article{qhub${new Date().getFullYear()},\n  author = {${paperData.authors}},\n  title = {${paperData.title}},\n  year = {${paperData.year || new Date().getFullYear()}}\n}`
    };
    db.researchPapers.unshift(newPaper);
    this.saveDB(db);
    return newPaper;
  },

  deleteResearch(id) {
    const db = this.getDB();
    db.researchPapers = db.researchPapers.filter(r => r.id !== id);
    this.saveDB(db);
  },

  // ---------------- COMPUTED STATS ----------------
  getStats() {
    const db = this.getDB();
    const students = db.students || [];
    const faculty = db.faculty || [];
    const courses = db.courses || [];
    const projects = db.projects || [];
    const certs = db.certificates || [];
    const papers = db.researchPapers || [];

    const totalStudentsCount = 1250 + students.length * 15;
    const totalLearnersCount = students.reduce((acc, s) => acc + (s.courses > 0 ? 1 : 0), 0) + 415;
    const totalFacultyTrained = faculty.length * 28 + 11;

    return {
      totalStudents: totalStudentsCount.toLocaleString() + "+",
      quantumLearners: totalLearnersCount.toLocaleString() + "+",
      coursesCount: courses.length.toString(),
      facultyTrained: totalFacultyTrained.toString(),
      projectsCount: (72 + projects.length).toString(),
      researchPapers: (21 + papers.length).toString(),
      certificatesCount: (537 + certs.length).toString(),
      quantumReadiness: "78%"
    };
  }
};

// Assign to global window
window.Q_DB = Q_DB;
