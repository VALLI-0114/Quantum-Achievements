import React, { useState } from 'react';
import { Layers, ArrowLeft, Search, User, ExternalLink, Code2, CheckCircle2, FileDown, Download, Trash2, Plus } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCategoryReportPDF, downloadProjectReportPDF } from '../../utils/pdfGenerator';

export const FacultyProjects = ({ onOpenProfile, onAddProject }) => {
  const { projects, faculty, students, deleteRecord, confirmDelete, removeProjectParticipant } = useQuantumDB();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const filteredProjects = projects.filter(p => {
    // Exclude projects explicitly targeted for students
    if (p.targetAudience === 'students' || p.targetAudience === 'student') return false;

    const isFacultyProject = p.targetAudience === 'faculty' ||
      (!p.targetAudience && p.facultyInvolved && p.facultyInvolved.length > 0 && (!p.studentsInvolved || p.studentsInvolved.length === 0)) ||
      (!p.targetAudience && (!p.studentsInvolved || p.studentsInvolved.length === 0));

    if (!isFacultyProject) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q) ||
      p.techStack?.some(t => t.toLowerCase().includes(q))
    );
  });

  const handleDownloadAllProjectsPDF = () => {
    const reportItems = projects.map(p => ({
      title: p.title,
      subtitle: `Domain: ${p.domain} • Tech: ${(p.techStack || []).join(', ')} • Status: ${p.status}`
    }));
    downloadCategoryReportPDF({
      categoryTitle: "Faculty Quantum Projects Report",
      roleType: "Faculty",
      items: reportItems
    });
  };

  if (selectedProject) {
    const facultyList = (selectedProject.facultyInvolved || []).map(fi => {
      const f = faculty.find(fac => fac.id === fi.facultyId) || {
        name: "Dr. Faculty Researcher",
        department: "Quantum Science",
        title: "Principal Investigator"
      };
      return { ...fi, faculty: f, facultyName: f.name, department: f.department };
    });

    const studentList = (selectedProject.studentsInvolved || []).map(si => {
      const s = students.find(stu => stu.id === si.studentId) || {
        name: "Student Researcher",
        department: "Information Technology",
        studentId: "QU-2025"
      };
      return { ...si, student: s, studentName: s.name, department: s.department };
    });

    const handleDownloadSingleProjectPDF = () => {
      downloadProjectReportPDF({
        project: {
          ...selectedProject,
          facultyInvolved: facultyList,
          studentsInvolved: studentList
        },
        roleType: "Faculty"
      });
    };

    return (
      <div className="drilldown-container">
        <div className="breadcrumb-trail">
          <span className="breadcrumb-link" onClick={() => setSelectedProjectId(null)}>
            <ArrowLeft size={16} /> Back to Faculty Projects
          </span>
          <span>/</span>
          <span>{selectedProject.id}</span>
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
                <span className="metric-pill secondary">{selectedProject.domain}</span>
                <span className="metric-pill success">{selectedProject.status}</span>
              </div>

              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem' }}>
                {selectedProject.title}
              </h1>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '820px' }}>
                {selectedProject.description}
              </p>

              {/* Tech Stack */}
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {(selectedProject.techStack || []).map((t, idx) => (
                  <span key={idx} className="metric-pill primary">{t}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={handleDownloadSingleProjectPDF}>
                <Download size={16} /> Download Project PDF
              </button>
              {selectedProject.githubUrl && (
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ textDecoration: 'none' }}
                >
                  <Code2 size={16} /> Repository <ExternalLink size={14} />
                </a>
              )}
              <button
                className="btn btn-danger"
                onClick={() => {
                  confirmDelete({
                    title: selectedProject.title,
                    message: `Are you sure you want to delete project "${selectedProject.title}"?`,
                    onConfirm: () => {
                      deleteRecord('projects', selectedProject.id);
                      setSelectedProjectId(null);
                    }
                  });
                }}
              >
                <Trash2 size={15} /> Delete Project
              </button>
            </div>
          </div>
        </div>

        {/* Faculty Involved Section */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Faculty Members & Research Leads ({facultyList.length})
          </h3>
          <div className="cards-grid-2">
            {facultyList.map((item, idx) => (
              <div key={idx} className="item-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
                      color: '#FFFFFF',
                      fontSize: '1rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.faculty.avatar || item.faculty.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.faculty.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.faculty.department}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onOpenProfile(item.faculty.id, 'faculty')}
                    >
                      <User size={14} /> Profile
                    </button>
                    <button
                      className="btn-icon-danger"
                      title="Remove faculty from project"
                      onClick={() => {
                        confirmDelete({
                          title: `Remove ${item.faculty.name}`,
                          message: `Remove ${item.faculty.name} from this project?`,
                          onConfirm: () => removeProjectParticipant(selectedProject.id, 'faculty', item.faculty.id)
                        });
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-light)',
                  fontSize: '0.82rem',
                  color: 'var(--secondary)',
                  fontWeight: 600
                }}>
                  Project Role: <strong>{item.role || 'Faculty Advisor'}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Collaborators */}
        {studentList.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Student Research Associates & Engineers ({studentList.length})
            </h3>
            <div className="cards-grid-2">
              {studentList.map((item, idx) => (
                <div key={idx} className="item-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.student.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.student.studentId} • {item.student.department}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenProfile(item.student.id, 'student')}
                      >
                        <User size={14} /> Profile
                      </button>
                      <button
                        className="btn-icon-danger"
                        title="Remove student from project"
                        onClick={() => {
                          confirmDelete({
                            title: `Remove ${item.student.name}`,
                            message: `Remove ${item.student.name} from this project?`,
                            onConfirm: () => removeProjectParticipant(selectedProject.id, 'students', item.student.id)
                          });
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-light)',
                    fontSize: '0.82rem',
                    color: 'var(--primary)',
                    fontWeight: 600
                  }}>
                    Assigned Task: <strong>{item.role}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
            placeholder="Search quantum projects by title, domain, or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={handleDownloadAllProjectsPDF}>
            <FileDown size={15} /> Download Projects PDF
          </button>
          <button className="btn btn-secondary" onClick={onAddProject}>
            <Plus size={16} /> Add Project
          </button>
        </div>
      </div>

      <div className="cards-grid-3">
        {filteredProjects.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3.5rem 1rem',
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-light)'
          }}>
            <Layers size={44} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 700 }}>No Faculty Projects Found</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Start by adding a quantum research project led by faculty.</p>
            <button className="btn btn-secondary" onClick={onAddProject}>➕ Add Project</button>
          </div>
        ) : (
          filteredProjects.map(project => {
            const facCount = (project.facultyInvolved || []).length;
            const stuCount = (project.studentsInvolved || []).length;

            return (
              <div
                key={project.id}
                className="item-card"
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <div className="card-header-row">
                  <span className="metric-pill secondary card-badge-pill" title={project.domain}>{project.domain}</span>
                  <div className="card-header-meta">
                    <span className="metric-pill success" style={{ fontSize: '0.74rem' }}>{project.status}</span>
                    <button
                      className="btn-icon-danger"
                      title="Delete Project"
                      style={{ flexShrink: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        confirmDelete({
                          title: project.title,
                          message: `Are you sure you want to delete project "${project.title}"?`,
                          onConfirm: () => deleteRecord('projects', project.id)
                        });
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="card-title-clamp" title={project.title}>
                  {project.title}
                </h3>

                <p className="card-desc-clamp" title={project.description}>
                  {project.description}
                </p>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem', marginTop: 'auto' }}>
                  {(project.techStack || []).slice(0, 4).map((t, idx) => (
                    <span key={idx} className="metric-pill primary" style={{ fontSize: '0.72rem' }}>{t}</span>
                  ))}
                  {(project.techStack || []).length > 4 && (
                    <span className="metric-pill secondary" style={{ fontSize: '0.72rem' }}>+{(project.techStack || []).length - 4}</span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-light)'
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Team: <strong>{facCount} Faculty</strong> • <strong>{stuCount} Students</strong>
                  </span>
                  <span className="btn btn-outline btn-sm">
                    View Project Details →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
