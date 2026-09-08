import React, { useState } from 'react';
import { FileText, ArrowLeft, Search, User, ExternalLink, Quote, FileDown, Download, Trash2, Edit3, UserPlus, Plus } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCategoryReportPDF, downloadPaperReportPDF } from '../../utils/pdfGenerator';
import { EditPaperModal } from '../common/EditPaperModal';
import { AddAuthorModal } from '../common/AddAuthorModal';

export const FacultyPapers = ({ onOpenProfile, onAddPaper }) => {
  const { researchPapers, faculty, students, deleteRecord, confirmDelete, removePaperAuthor } = useQuantumDB();
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPaper, setEditingPaper] = useState(null);
  const [isAddAuthorOpen, setIsAddAuthorOpen] = useState(false);
  const [addAuthorRoleType, setAddAuthorRoleType] = useState('faculty');

  const selectedPaper = researchPapers.find(p => p.id === selectedPaperId);

  const filteredPapers = researchPapers.filter(p => {
    // Exclude research papers explicitly targeted for students
    if (p.targetAudience === 'students' || p.targetAudience === 'student') return false;

    const isFacultyPaper = p.targetAudience === 'faculty' ||
      (!p.targetAudience && p.facultyAuthors && p.facultyAuthors.length > 0 && (!p.studentAuthors || p.studentAuthors.length === 0)) ||
      (!p.targetAudience && (!p.studentAuthors || p.studentAuthors.length === 0));

    if (!isFacultyPaper) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      (p.venue && p.venue.toLowerCase().includes(q)) ||
      (p.researchArea && p.researchArea.toLowerCase().includes(q))
    );
  });

  const handleDownloadAllPapersPDF = () => {
    const reportItems = researchPapers.map(paper => ({
      title: paper.title,
      subtitle: `Venue: ${paper.venue} • DOI: ${paper.doi} • Citations: ${paper.citations}`
    }));
    downloadCategoryReportPDF({
      categoryTitle: "Faculty Quantum Research Publications Report",
      roleType: "Faculty",
      items: reportItems
    });
  };

  if (selectedPaper) {
    const facAuthors = (selectedPaper.facultyAuthors || []).map(fid => {
      return faculty.find(f => f.id === fid) || { id: fid, name: "Dr. Faculty Author", department: "Physics" };
    });

    const stuAuthors = (selectedPaper.studentAuthors || []).map(sid => {
      return students.find(s => s.id === sid) || { id: sid, name: "Student Co-Author", department: "Computer Science" };
    });

    const handleDownloadSinglePaperPDF = () => {
      downloadPaperReportPDF({
        paper: selectedPaper,
        facultyAuthors: facAuthors,
        studentAuthors: stuAuthors
      });
    };

    return (
      <div className="drilldown-container">
        <div className="breadcrumb-trail">
          <span className="breadcrumb-link" onClick={() => setSelectedPaperId(null)}>
            <ArrowLeft size={16} /> Back to Faculty Research Papers
          </span>
          <span>/</span>
          <span>{selectedPaper.id}</span>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className="metric-pill secondary">{selectedPaper.researchArea}</span>
                <span className="metric-pill primary">Citations: {selectedPaper.citations}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date: {selectedPaper.date}</span>
              </div>

              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem' }}>
                "{selectedPaper.title}"
              </h1>

              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '1rem' }}>
                Published in: {selectedPaper.venue}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setEditingPaper(selectedPaper)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Edit3 size={15} /> Edit Paper
              </button>
              <button className="btn btn-outline" onClick={handleDownloadSinglePaperPDF}>
                <Download size={16} /> Download Paper PDF
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  confirmDelete({
                    title: selectedPaper.title,
                    message: `Are you sure you want to delete paper "${selectedPaper.title}"?`,
                    onConfirm: () => {
                      deleteRecord('researchPapers', selectedPaper.id);
                      setSelectedPaperId(null);
                    }
                  });
                }}
              >
                <Trash2 size={16} /> Delete Paper
              </button>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface-subtle)',
            borderRadius: '10px',
            padding: '1.25rem',
            border: '1px solid var(--border-light)',
            marginBottom: '1.25rem'
          }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              Abstract
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {selectedPaper.abstract}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>DOI: <strong style={{ color: 'var(--text-primary)' }}>{selectedPaper.doi}</strong></span>
          </div>
        </div>

        {/* Authors Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Faculty Authors ({facAuthors.length})
            </h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setAddAuthorRoleType('faculty');
                setIsAddAuthorOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <UserPlus size={14} /> + Add Faculty Author
            </button>
          </div>

          <div className="cards-grid-2" style={{ marginBottom: '1.5rem' }}>
            {facAuthors.map(f => (
              <div key={f.id} className="item-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {f.avatar || f.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{f.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.department}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => onOpenProfile(f.id, 'faculty')}>
                      <User size={14} /> Profile
                    </button>
                    <button
                      className="btn-icon-danger"
                      title="Remove Faculty Author"
                      onClick={() => {
                        confirmDelete({
                          title: `Remove ${f.name}`,
                          message: `Remove ${f.name} from this paper?`,
                          onConfirm: () => removePaperAuthor(selectedPaper.id, 'faculty', f.id)
                        });
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Student Co-Authors Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Student Co-Authors ({stuAuthors.length})
            </h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setAddAuthorRoleType('student');
                setIsAddAuthorOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <UserPlus size={14} /> + Add Student Author
            </button>
          </div>

          <div className="cards-grid-2">
            {stuAuthors.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--bg-surface-subtle)',
                borderRadius: '12px',
                border: '1px dashed var(--border-light)',
                color: 'var(--text-muted)',
                fontSize: '0.88rem'
              }}>
                No student co-authors currently assigned to this publication.
              </div>
            ) : (
              stuAuthors.map(s => (
                <div key={s.id} className="item-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{s.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.studentId} • {s.department}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => onOpenProfile(s.id, 'student')}>
                        <User size={14} /> Profile
                      </button>
                      <button
                        className="btn-icon-danger"
                        title="Remove Student Author"
                        onClick={() => {
                          confirmDelete({
                            title: `Remove ${s.name}`,
                            message: `Remove ${s.name} from this paper?`,
                            onConfirm: () => removePaperAuthor(selectedPaper.id, 'student', s.id)
                          });
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modals */}
        <EditPaperModal
          isOpen={!!editingPaper}
          onClose={() => setEditingPaper(null)}
          paper={editingPaper}
        />
        <AddAuthorModal
          isOpen={isAddAuthorOpen}
          onClose={() => setIsAddAuthorOpen(false)}
          paperId={selectedPaper.id}
          paperTitle={selectedPaper.title}
          initialRoleType={addAuthorRoleType}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="view-toolbar">
        <div className="view-search-box">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search research papers by title, journal venue, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={handleDownloadAllPapersPDF}>
            <FileDown size={15} /> Download Papers PDF
          </button>
          <button className="btn btn-secondary" onClick={onAddPaper}>
            ➕ Add Research Paper
          </button>
        </div>
      </div>

      <div className="cards-grid-2">
        {filteredPapers.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3.5rem 1rem',
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-light)'
          }}>
            <FileText size={44} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 700 }}>No Research Papers Found</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Start by indexing a quantum research paper authored by faculty.</p>
            <button className="btn btn-secondary" onClick={onAddPaper}>➕ Add Research Paper</button>
          </div>
        ) : (
          filteredPapers.map(paper => {
            const facCount = (paper.facultyAuthors || []).length;
            const stuCount = (paper.studentAuthors || []).length;

            return (
              <div
                key={paper.id}
                className="item-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedPaperId(paper.id)}
              >
                <div className="card-header-row">
                  <span className="metric-pill secondary card-badge-pill" title={paper.researchArea}>{paper.researchArea}</span>
                  <div className="card-header-meta">
                    <span className="metric-pill primary" style={{ fontSize: '0.74rem' }}>{paper.citations || 0} Citations</span>
                    <button
                      className="btn-icon"
                      title="Edit Paper Details"
                      style={{
                        flexShrink: 0,
                        padding: '4px',
                        background: 'var(--secondary-light)',
                        color: 'var(--secondary)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setEditingPaper(paper);
                      }}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      className="btn-icon-danger"
                      title="Delete Research Paper"
                      style={{ flexShrink: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        confirmDelete({
                          title: paper.title,
                          message: `Are you sure you want to delete "${paper.title}"?`,
                          onConfirm: () => deleteRecord('researchPapers', paper.id)
                        });
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="card-title-clamp" title={paper.title}>
                  "{paper.title}"
                </h3>

                <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={paper.venue}>
                  {paper.venue}
                </div>

                <p className="card-desc-clamp" title={paper.abstract}>
                  {paper.abstract}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-light)'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Authors: <strong>{facCount} Faculty</strong> • <strong>{stuCount} Students</strong>
                  </span>
                  <span className="btn btn-outline btn-sm">
                    View Paper & Authors →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals for List View */}
      <EditPaperModal
        isOpen={!!editingPaper}
        onClose={() => setEditingPaper(null)}
        paper={editingPaper}
      />
    </div>
  );
};
