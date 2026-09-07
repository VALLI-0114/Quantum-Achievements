import React, { useState } from 'react';
import { Layers, ArrowLeft, Search, User, Code2, CheckCircle2, FileDown, Download, Trash2 } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCategoryReportPDF, downloadProjectReportPDF } from '../../utils/pdfGenerator';

export const StudentProjects = ({ onOpenProfile, onAddProject }) => {
  const { projects, students, faculty, deleteRecord, removeProjectParticipant } = useQuantumDB();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q) ||
      p.techStack?.some(t => t.toLowerCase().includes(q))
    );
  });

  const handleDownloadAllStudentProjectsPDF = () => {
    const reportItems = projects.map(p => ({
      title: p.title,
      subtitle: `Domain: ${p.domain} • Tech: ${(p.techStack || []).join(', ')} • Students Involved: ${(p.studentsInvolved || []).length}`
    }));
    downloadCategoryReportPDF({
      categoryTitle: "Student Quantum Projects Report",
      roleType: "Student",
      items: reportItems
    });
  };

  if (selectedProject) {
    const studentList = (selectedProject.studentsInvolved || []).map(si => {
      const s = students.find(stu => stu.id === si.studentId) || {
        name: "Student Lead",
        department: "Information Technology",
        studentId: "QU-2023"
      };
      return { ...si, student: s, studentName: s.name, department: s.department };
    });

    const facultyList = (selectedProject.facultyInvolved || []).map(fi => {
      const f = faculty.find(fac => fac.id === fi.facultyId) || {
        name: "Dr. Faculty Mentor",
        department: "Physics"
      };
      return { ...fi, faculty: f, facultyName: f.name, department: f.department };
    });

    const handleDownloadSingleProjectPDF = () => {
      downloadProjectReportPDF({
        project: {
          ...selectedProject,
          facultyInvolved: facultyList,
          studentsInvolved: studentList
        },
        roleType: "Student"
      });
    };

    return (
      <div className="drilldown-container">
        <div className="breadcrumb-trail">
          <span className="breadcrumb-link" onClick={() => setSelectedProjectId(null)}>
            <ArrowLeft size={16} /> Back to Student Projects
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
                <span className="metric-pill primary">{selectedProject.domain}</span>
                <span className="metric-pill success">{selectedProject.status}</span>
              </div>

              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem' }}>
                {selectedProject.title}
              </h1>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '820px' }}>
                {selectedProject.description}
              </p>

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
                  <Code2 size={16} /> View Code & Repo
                </a>
              )}
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${selectedProject.title}"?`)) {
                    deleteRecord('projects', selectedProject.id);
                    setSelectedProjectId(null);
                  }
                }}
              >
                <Trash2 size={16} /> Delete Project
              </button>
            </div>
          </div>
        </div>

        {/* Student Team Section */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Student Creators & Developers ({studentList.length})
          </h3>
          <div className="cards-grid-2">
            {studentList.map((item, idx) => (
              <div key={idx} className="item-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.student.avatar || item.student.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{item.student.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.student.studentId} • {item.student.department}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => onOpenProfile(item.student.id, 'student')}>
                      <User size={14} /> Profile
                    </button>
                    <button
                      className="btn-icon-danger"
                      title="Remove Student from Project"
                      onClick={() => {
                        if (window.confirm(`Remove ${item.student.name} from this project?`)) {
                          removeProjectParticipant(selectedProject.id, 'student', item.studentId);
                        }
                      }}
                    >
                      <Trash2 size={15} />
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
                  Team Role: <strong>{item.role}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Faculty Mentors */}
        {facultyList.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Faculty Research Mentors & Advisors ({facultyList.length})
            </h3>
            <div className="cards-grid-2">
              {facultyList.map((item, idx) => (
                <div key={idx} className="item-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.95rem' }}>{item.faculty.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.faculty.department}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => onOpenProfile(item.faculty.id, 'faculty')}>
                        <User size={14} /> Profile
                      </button>
                      <button
                        className="btn-icon-danger"
                        title="Remove Faculty from Project"
                        onClick={() => {
                          if (window.confirm(`Remove ${item.faculty.name} from this project?`)) {
                            removeProjectParticipant(selectedProject.id, 'faculty', item.facultyId);
                          }
                        }}
                      >
                        <Trash2 size={15} />
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
                    Mentorship: <strong>{item.role || 'Faculty Advisor'}</strong>
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
            placeholder="Search student quantum projects by domain or technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={handleDownloadAllStudentProjectsPDF}>
            <FileDown size={15} /> Download Projects PDF
          </button>
          <button className="btn btn-primary" onClick={onAddProject}>
            ➕ Add Project
          </button>
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
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 700 }}>No Student Projects Found</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Start by adding a student quantum project.</p>
            <button className="btn btn-primary" onClick={onAddProject}>➕ Add Project</button>
          </div>
        ) : (
          filteredProjects.map(project => {
            const facCount = (project.facultyInvolved || []).length;
            const stuCount = (project.studentsInvolved || []).length;

            return (
              <div
                key={project.id}
                className="item-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="metric-pill primary">{project.domain}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="metric-pill success">{project.status}</span>
                    <button
                      className="btn-icon-danger"
                      title="Delete Project"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
                          deleteRecord('projects', project.id);
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {project.title}
                </h3>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flex: 1 }}>
                  {project.description}
                </p>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {(project.techStack || []).map((t, idx) => (
                    <span key={idx} className="metric-pill primary" style={{ fontSize: '0.72rem' }}>{t}</span>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-light)'
                }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Team: <strong>{stuCount} Students</strong> • Mentors: <strong>{facCount} Faculty</strong>
                  </span>
                  <span className="btn btn-outline btn-sm">
                    View Team & Details →
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
};
