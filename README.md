# ⚛️ Q-HUB | Institutional Quantum Achievements & Research Portal

A modern, high-performance web platform for managing and showcasing quantum-related achievements for faculty members and student scholars. Built with **React 19**, **Vite**, **Vanilla CSS**, and **jsPDF**.

---

## 🌟 Key Features

- 🏛️ **Hierarchical Achievement Exploration**:
  - **Faculty Achievements**: Courses, Industry Certifications, Research Projects, Publications, and Hackathons.
  - **Student Achievements**: Completed Courses, Verified Credentials, Project Engineering, Research Papers, and Competitions.
- 🔍 **Candidate & Record Search**: Instant multi-attribute search across names, roll numbers, departments, domains, and issuers.
- 📄 **Multi-Tiered PDF Export Engine**:
  - Entire Institutional Academic Dossier (top navbar).
  - All Faculty / Student Comprehensive Reports.
  - Category-wide tabular summaries (Courses, Certifications, Projects, Papers, Hackathons).
  - Individual drilldown reports (Course Rosters, Certificate Recipients, Project Dossiers, Research Papers, Hackathon Reports, and Candidate Transcripts).
- 🎓 **Dynamic Participant & Candidate Addition**:
  - `➕ Add Student to Course` & `➕ Add Faculty to Course` directly from drill-down roster views.
  - Select registered members or register new candidates on-the-fly.
  - Certificate file uploads (PDF, PNG, JPG) with verification modals.
- 💾 **Local Persistence & Zero Dummy Data**:
  - Starts with a clean, ready-to-use dataset for live institutional data entry.
  - Persistent reactive client storage with full CRUD capabilities.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**

### Installation

```bash
# Clone repository
git clone https://github.com/VALLI-0114/Quantum-Achievements.git

# Navigate to project directory
cd Quantum-Achievements

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Lucide Icons, Canvas-Confetti
- **Build Tool**: Vite 8
- **Styling**: Modern Vanilla CSS (Design Tokens, Glassmorphism, Responsive Grid & Flexbox)
- **Reporting Engine**: jsPDF & jsPDF-AutoTable
- **State Management**: React Context & Hooks (`QuantumDBContext`)

---

## 📄 License
This project is licensed under the MIT License.
