import React from 'react';
import { Search, Plus, FileDown, Menu, Sparkles } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCompleteInstitutionalPDF } from '../../utils/pdfGenerator';

export const Header = ({ onOpenSearch, onOpenAddModal, onToggleSidebar }) => {
  const db = useQuantumDB();

  const handleDownloadEntireReport = () => {
    downloadCompleteInstitutionalPDF({
      faculty: db.faculty,
      students: db.students,
      courses: db.courses,
      certificates: db.certificates,
      projects: db.projects,
      researchPapers: db.researchPapers,
      hackathons: db.hackathons
    });
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Toggle Navigation" style={{ display: 'none' }}>
          <Menu size={22} />
        </button>

        {/* Global Search Input Trigger */}
        <div className="global-search-bar" onClick={onOpenSearch}>
          <Search size={16} />
          <span className="search-placeholder">Search student & faculty achievements, courses, hackathons...</span>
          <span className="search-kbd">Ctrl K</span>
        </div>
      </div>

      <div className="header-right">
        {/* Quick Add Achievement Record */}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => onOpenAddModal('courses', 'faculty')}
        >
          <Plus size={15} /> Add Record
        </button>

        {/* Master PDF Download: Download Entire Data Report PDF */}
        <button
          className="btn btn-outline btn-sm"
          onClick={handleDownloadEntireReport}
          title="Download Complete Institutional Quantum Report (PDF)"
          style={{ fontWeight: 700, borderColor: 'var(--primary-border)', color: 'var(--primary-deep)', background: 'var(--primary-light)' }}
        >
          <FileDown size={15} /> Export Entire Report (PDF)
        </button>
      </div>
    </header>
  );
};
