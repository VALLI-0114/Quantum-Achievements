import React, { useState, useEffect } from 'react';
import { Search, X, User, BookOpen, Award, Layers, FileText, Trophy, ArrowRight } from 'lucide-react';
import { useQuantumDB } from '../../data/db';

export const GlobalSearchModal = ({
  isOpen,
  onClose,
  onSelectFaculty,
  onSelectStudent,
  onSelectCourse,
  onSelectCertificate,
  onSelectProject,
  onSelectPaper,
  onSelectHackathon
}) => {
  const { faculty, students, courses, certificates, projects, researchPapers, hackathons } = useQuantumDB();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter items
  const matchedFaculty = q ? faculty.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.department.toLowerCase().includes(q) ||
    f.highestHonor?.toLowerCase().includes(q)
  ) : [];

  const matchedStudents = q ? students.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.studentId.toLowerCase().includes(q) ||
    s.department.toLowerCase().includes(q) ||
    s.highestHonor?.toLowerCase().includes(q) ||
    s.skills?.some(sk => sk.toLowerCase().includes(q))
  ) : [];

  const matchedCourses = q ? courses.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q)
  ) : [];

  const matchedCerts = q ? certificates.filter(cert =>
    cert.title.toLowerCase().includes(q) ||
    cert.issuer.toLowerCase().includes(q)
  ) : [];

  const matchedProjects = q ? projects.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.domain.toLowerCase().includes(q) ||
    p.techStack?.some(t => t.toLowerCase().includes(q))
  ) : [];

  const matchedPapers = q ? researchPapers.filter(paper =>
    paper.title.toLowerCase().includes(q) ||
    paper.venue.toLowerCase().includes(q) ||
    paper.researchArea.toLowerCase().includes(q)
  ) : [];

  const matchedHackathons = q ? hackathons.filter(h =>
    h.name.toLowerCase().includes(q) ||
    h.edition.toLowerCase().includes(q) ||
    h.studentParticipants?.some(sp => sp.award.toLowerCase().includes(q) || sp.projectBuilt.toLowerCase().includes(q))
  ) : [];

  const totalResults = matchedFaculty.length + matchedStudents.length + matchedCourses.length +
    matchedCerts.length + matchedProjects.length + matchedPapers.length + matchedHackathons.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <Search size={20} style={{ color: 'var(--primary)' }} />
          <input
            type="text"
            placeholder="Search students, faculty, courses, certificates, hackathons..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              color: 'var(--text-primary)',
              background: 'transparent'
            }}
          />
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {!q ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Search size={36} style={{ color: 'var(--border-subtle)', marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.92rem' }}>Type any student name, course title, certificate, project, or paper...</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <span className="search-kbd" onClick={() => setQuery("Pravallika")} style={{ cursor: 'pointer' }}>Pravallika</span>
                <span className="search-kbd" onClick={() => setQuery("Qiskit")} style={{ cursor: 'pointer' }}>Qiskit</span>
                <span className="search-kbd" onClick={() => setQuery("Elena Vance")} style={{ cursor: 'pointer' }}>Elena Vance</span>
                <span className="search-kbd" onClick={() => setQuery("VQE")} style={{ cursor: 'pointer' }}>VQE</span>
                <span className="search-kbd" onClick={() => setQuery("Hackathon")} style={{ cursor: 'pointer' }}>Hackathon</span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              No results found for "<strong>{query}</strong>".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Students */}
              {matchedStudents.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Students ({matchedStudents.length})
                  </div>
                  {matchedStudents.map(s => (
                    <div
                      key={s.id}
                      onClick={() => { onSelectStudent(s.id); onClose(); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: 'var(--bg-surface-subtle)',
                        marginBottom: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={16} style={{ color: 'var(--primary)' }} />
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                            {s.studentId} • {s.department}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Faculty */}
              {matchedFaculty.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Faculty Members ({matchedFaculty.length})
                  </div>
                  {matchedFaculty.map(f => (
                    <div
                      key={f.id}
                      onClick={() => { onSelectFaculty(f.id); onClose(); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: 'var(--bg-surface-subtle)',
                        marginBottom: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={16} style={{ color: 'var(--secondary)' }} />
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{f.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                            {f.title} • {f.department}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Courses */}
              {matchedCourses.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Quantum Courses ({matchedCourses.length})
                  </div>
                  {matchedCourses.map(c => (
                    <div
                      key={c.id}
                      onClick={() => { onSelectCourse(c.id); onClose(); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: 'var(--bg-surface-subtle)',
                        marginBottom: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BookOpen size={16} style={{ color: 'var(--accent-teal)' }} />
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.code}: {c.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                            {c.provider}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Hackathons */}
              {matchedHackathons.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Hackathons ({matchedHackathons.length})
                  </div>
                  {matchedHackathons.map(h => (
                    <div
                      key={h.id}
                      onClick={() => { onSelectHackathon(h.id); onClose(); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: 'var(--bg-surface-subtle)',
                        marginBottom: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Trophy size={16} style={{ color: '#D97706' }} />
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{h.name}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                            {h.edition} • {h.date}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
