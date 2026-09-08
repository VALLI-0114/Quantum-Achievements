import React, { useState } from 'react';
import { Search, Plus, FileDown, Menu, Cloud, CloudCheck, RefreshCw, AlertCircle, Database, Check } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCompleteInstitutionalPDF } from '../../utils/pdfGenerator';
import { SupabaseSetupModal } from '../common/SupabaseSetupModal';

export const Header = ({ onOpenSearch, onOpenAddModal, onToggleSidebar }) => {
  const db = useQuantumDB();
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(false);

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

  const handleManualSync = async () => {
    setSyncFeedback(true);
    await db.forceCloudSync();
    setTimeout(() => setSyncFeedback(false), 2000);
  };

  const getStatusBadge = () => {
    switch (db.cloudStatus) {
      case 'synced':
        return (
          <button
            className="cloud-status-pill success"
            onClick={handleManualSync}
            title={db.lastSyncTime ? `Supabase Connected & Synced (${db.lastSyncTime.toLocaleTimeString()}). Click to force push.` : "Supabase Connected & Synced. Click to sync."}
          >
            <span className="status-dot green"></span>
            <Cloud size={14} />
            <span>{syncFeedback ? 'Saved to Cloud!' : 'Supabase Synced'}</span>
          </button>
        );
      case 'syncing':
        return (
          <div className="cloud-status-pill warning" title="Pushing changes to Supabase Cloud...">
            <RefreshCw size={13} className="spin" />
            <span>Saving to Supabase...</span>
          </div>
        );
      case 'table_needed':
        return (
          <button
            className="cloud-status-pill danger"
            onClick={() => setIsSetupModalOpen(true)}
            title="Click to run Supabase table setup query"
          >
            <AlertCircle size={14} />
            <span>Setup Supabase Table</span>
          </button>
        );
      case 'offline':
      default:
        return (
          <button
            className="cloud-status-pill danger"
            onClick={handleManualSync}
            title={db.syncError || "Connecting to Supabase... Click to retry."}
          >
            <AlertCircle size={14} />
            <span>Supabase Offline (Retry)</span>
          </button>
        );
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Toggle Navigation">
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
          {/* Cloud Database Status */}
          {getStatusBadge()}

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

      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />
    </>
  );
};
