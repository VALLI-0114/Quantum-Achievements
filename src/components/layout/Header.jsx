import React, { useState } from 'react';
import { Search, Plus, FileDown, Menu, Database, Cloud, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCompleteInstitutionalPDF } from '../../utils/pdfGenerator';
import { SupabaseSetupModal } from '../common/SupabaseSetupModal';

export const Header = ({ onOpenSearch, onOpenAddModal, onToggleSidebar }) => {
  const db = useQuantumDB();
  const [setupModalOpen, setSetupModalOpen] = useState(false);

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

  const renderCloudBadge = () => {
    switch (db.cloudStatus) {
      case 'synced':
        return (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setSetupModalOpen(true)}
            title="Live Connected to Supabase Cloud. All devices synchronized!"
            style={{
              background: '#ECFDF5',
              color: '#059669',
              borderColor: '#A7F3D0',
              fontSize: '0.78rem',
              padding: '0.35rem 0.75rem',
              fontWeight: 700
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
            Supabase Synced
          </button>
        );
      case 'syncing':
        return (
          <div
            className="btn btn-sm"
            style={{
              background: '#EFF6FF',
              color: 'var(--primary)',
              borderColor: '#BFDBFE',
              fontSize: '0.78rem',
              padding: '0.35rem 0.75rem',
              fontWeight: 600
            }}
          >
            <RefreshCw size={12} className="spin-slow" />
            Syncing...
          </div>
        );
      case 'table_needed':
        return (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setSetupModalOpen(true)}
            title="Click to copy 10-second SQL script for Supabase SQL Editor"
            style={{
              background: '#FEF3C7',
              color: '#D97706',
              borderColor: '#FDE68A',
              fontSize: '0.78rem',
              padding: '0.35rem 0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <AlertCircle size={13} />
            Setup Cloud DB
          </button>
        );
      default:
        return (
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setSetupModalOpen(true)}
            title="Local Storage active. Click to check Supabase configuration"
            style={{
              background: '#F8FAFC',
              color: 'var(--text-muted)',
              borderColor: 'var(--border-light)',
              fontSize: '0.78rem',
              padding: '0.35rem 0.75rem'
            }}
          >
            <Cloud size={13} />
            Cloud Storage
          </button>
        );
    }
  };

  return (
    <>
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
          {/* Cloud Sync Status Pill */}
          {renderCloudBadge()}

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

      {/* Supabase Setup Helper Modal */}
      <SupabaseSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
      />
    </>
  );
};
