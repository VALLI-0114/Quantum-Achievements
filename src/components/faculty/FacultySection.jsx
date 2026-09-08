import React, { useState } from 'react';
import { BookOpen, Award, Layers, FileText, Trophy, Plus, FileDown } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadAllFacultyDataPDF } from '../../utils/pdfGenerator';
import { FacultyCourses } from './FacultyCourses';
import { FacultyCertificates } from './FacultyCertificates';
import { FacultyProjects } from './FacultyProjects';
import { FacultyPapers } from './FacultyPapers';
import { FacultyHackathons } from './FacultyHackathons';

export const FacultySection = ({ onOpenCertificate, onOpenProfile, onOpenAddModal }) => {
  const [activeTab, setActiveTab] = useState('courses');
  const db = useQuantumDB();

  const handleDownloadAllFacultyReport = () => {
    downloadAllFacultyDataPDF({
      faculty: db.faculty,
      courses: db.courses,
      certificates: db.certificates,
      projects: db.projects,
      researchPapers: db.researchPapers,
      hackathons: db.hackathons
    });
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="metric-pill secondary" style={{ fontWeight: 700 }}>Section 1</span>
            <span style={{ fontSize: '0.88rem', color: '#1E293B', fontWeight: 600 }}>Institutional Research & Faculty Core</span>
          </div>
          <h1>Faculty Quantum Contributions & Research</h1>
          <p>
            Explore quantum-related contributions of faculty members across verified courses, accredited certifications, projects, research publications, and hackathons.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            onClick={handleDownloadAllFacultyReport}
            title="Download complete PDF report of all faculty achievements"
            style={{ fontWeight: 700, borderColor: 'var(--secondary-border)', color: 'var(--secondary)', background: 'var(--secondary-light)' }}
          >
            <FileDown size={15} /> Export All Faculty Data (PDF)
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => onOpenAddModal(activeTab, 'faculty')}
          >
            <Plus size={16} /> Add {activeTab === 'courses' ? 'Course' : activeTab === 'certificates' ? 'Certificate' : activeTab === 'projects' ? 'Project' : activeTab === 'papers' ? 'Paper' : 'Hackathon'}
          </button>
        </div>
      </div>

      {/* Top Category Navigation Tabs: Courses | Certificates | Projects | Research Papers | Hackathons */}
      <div className="category-nav-tabs">
        <button
          className={`category-tab-btn ${activeTab === 'courses' ? 'active purple' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={17} /> Courses
        </button>

        <button
          className={`category-tab-btn ${activeTab === 'certificates' ? 'active purple' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          <Award size={17} /> Certificates
        </button>

        <button
          className={`category-tab-btn ${activeTab === 'projects' ? 'active purple' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <Layers size={17} /> Projects
        </button>

        <button
          className={`category-tab-btn ${activeTab === 'papers' ? 'active purple' : ''}`}
          onClick={() => setActiveTab('papers')}
        >
          <FileText size={17} /> Research Papers
        </button>

        <button
          className={`category-tab-btn ${activeTab === 'hackathons' ? 'active purple' : ''}`}
          onClick={() => setActiveTab('hackathons')}
        >
          <Trophy size={17} /> Hackathons
        </button>
      </div>

      {/* Category Views */}
      {activeTab === 'courses' && (
        <FacultyCourses
          onOpenCertificate={onOpenCertificate}
          onOpenProfile={onOpenProfile}
          onAddCourse={() => onOpenAddModal('courses', 'faculty')}
        />
      )}

      {activeTab === 'certificates' && (
        <FacultyCertificates
          onOpenCertificate={onOpenCertificate}
          onOpenProfile={onOpenProfile}
          onAddCertificate={() => onOpenAddModal('certificates', 'faculty')}
        />
      )}

      {activeTab === 'projects' && (
        <FacultyProjects
          onOpenProfile={onOpenProfile}
          onAddProject={() => onOpenAddModal('projects', 'faculty')}
        />
      )}

      {activeTab === 'papers' && (
        <FacultyPapers
          onOpenProfile={onOpenProfile}
          onAddPaper={() => onOpenAddModal('papers', 'faculty')}
        />
      )}

      {activeTab === 'hackathons' && (
        <FacultyHackathons
          onOpenProfile={onOpenProfile}
          onAddHackathon={() => onOpenAddModal('hackathons', 'faculty')}
        />
      )}
    </div>
  );
};
