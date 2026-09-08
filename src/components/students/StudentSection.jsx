import React, { useState } from 'react';
import { BookOpen, Award, Layers, FileText, Trophy, Plus, FileDown } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadAllStudentDataPDF } from '../../utils/pdfGenerator';
import { StudentCourses } from './StudentCourses';
import { StudentCertificates } from './StudentCertificates';
import { StudentProjects } from './StudentProjects';
import { StudentPapers } from './StudentPapers';
import { StudentHackathons } from './StudentHackathons';

export const StudentSection = ({ onOpenCertificate, onOpenProfile, onOpenAddModal }) => {
  const [activeTab, setActiveTab] = useState('courses');
  const db = useQuantumDB();

  const handleDownloadAllStudentReport = () => {
    downloadAllStudentDataPDF({
      students: db.students,
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
            <span className="metric-pill primary" style={{ fontWeight: 700 }}>Section 2</span>
            <span style={{ fontSize: '0.88rem', color: '#1E293B', fontWeight: 600 }}>Undergraduate & Graduate Scholars</span>
          </div>
          <h1>Student Quantum Contributions & Completed Courses</h1>
          <p>
            Explore quantum-related contributions of student candidates across completed courses, accredited industry certifications, projects, research papers, and hackathons.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            onClick={handleDownloadAllStudentReport}
            title="Download complete PDF report of all student achievements"
            style={{ fontWeight: 700, borderColor: 'var(--primary-border)', color: 'var(--primary)', background: 'var(--primary-light)' }}
          >
            <FileDown size={15} /> Export All Student Data (PDF)
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onOpenAddModal(activeTab, 'students')}
          >
            <Plus size={16} /> Add {activeTab === 'courses' ? 'Course' : activeTab === 'certificates' ? 'Certificate' : activeTab === 'projects' ? 'Project' : activeTab === 'papers' ? 'Paper' : 'Hackathon'}
          </button>
        </div>
      </div>

      {/* Top Category Navigation Tabs: Courses | Certificates | Projects | Research Papers | Hackathons */}
      <div className="category-nav-tabs">
        <button
          className={`category-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <BookOpen size={17} /> Courses
        </button>

        <button
          className={`category-tab-btn ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          <Award size={17} /> Certificates
        </button>

        <button
          className={`category-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <Layers size={17} /> Projects
        </button>

        <button
          className={`category-tab-btn ${activeTab === 'papers' ? 'active' : ''}`}
          onClick={() => setActiveTab('papers')}
        >
          <FileText size={17} /> Research Papers
        </button>

        <button
          className={`category-tab-btn ${activeTab === 'hackathons' ? 'active' : ''}`}
          onClick={() => setActiveTab('hackathons')}
        >
          <Trophy size={17} /> Hackathons
        </button>
      </div>

      {/* Category Views */}
      {activeTab === 'courses' && (
        <StudentCourses
          onOpenCertificate={onOpenCertificate}
          onOpenProfile={onOpenProfile}
          onAddCourse={() => onOpenAddModal('courses', 'students')}
        />
      )}

      {activeTab === 'certificates' && (
        <StudentCertificates
          onOpenCertificate={onOpenCertificate}
          onOpenProfile={onOpenProfile}
          onAddCertificate={() => onOpenAddModal('certificates', 'students')}
        />
      )}

      {activeTab === 'projects' && (
        <StudentProjects
          onOpenProfile={onOpenProfile}
          onAddProject={() => onOpenAddModal('projects', 'students')}
        />
      )}

      {activeTab === 'papers' && (
        <StudentPapers
          onOpenProfile={onOpenProfile}
          onAddPaper={() => onOpenAddModal('papers', 'students')}
        />
      )}

      {activeTab === 'hackathons' && (
        <StudentHackathons
          onOpenProfile={onOpenProfile}
          onAddHackathon={() => onOpenAddModal('hackathons', 'students')}
        />
      )}
    </div>
  );
};
