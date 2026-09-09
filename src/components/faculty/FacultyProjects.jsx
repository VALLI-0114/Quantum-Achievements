import React, { useState } from 'react';
import { Layers, ArrowLeft, Search, User, ExternalLink, Code2, CheckCircle2, FileDown, Download, Trash2, Edit3, UserPlus, Plus } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCategoryReportPDF, downloadProjectReportPDF } from '../../utils/pdfGenerator';
import { EditProjectModal } from '../common/EditProjectModal';
import { AddTeammateModal } from '../common/AddTeammateModal';

export const FacultyProjects = ({ onOpenProfile, onAddProject }) => {
  const { projects, faculty, students, deleteRecord, confirmDelete, removeProjectParticipant } = useQuantumDB();
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [isAddTeammateOpen, setIsAddTeammateOpen] = useState(false);
  const [addTeammateRoleType, setAddTeammateRoleType] = useState('faculty');

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
      const fid = (typeof fi === 'object' && fi) ? (fi.facultyId || fi.id || fi.name || fi.facultyName) : fi;
      const cleanNameCandidate = (typeof fi === 'object' && fi) ? (fi.facultyName || fi.name) : (typeof fi === 'string' && !fi.startsWith('FAC-') ? fi : '');

      const f = faculty.find(fac => 
        fac.id === fid || 
        fac.facultyId === fid || 
        (cleanNameCandidate && fac.name.toLowerCase() === cleanNameCandidate.toLowerCase()) ||
        (typeof fid === 'string' && fac.name.toLowerCase() === fid.toLowerCase())
      );
      if (f) return { ...fi, faculty: f, facultyName: f.name, department: f.department || fi.department || 'Quantum Science' };

      const fallbackName = cleanNameCandidate || (typeof fid === 'string' && !fid.startsWith('FAC-') ? fid : (typeof fi === 'object' && fi?.facultyName ? fi.facultyName : (typeof fid === 'string' && fid.startsWith('FAC-') ? `Faculty (${fid})` : "Dr. Faculty Researcher")));
      const dept = (typeof fi === 'object' && fi?.department) ? fi.department : "Quantum Science";
      const title = (typeof fi === 'object' && fi?.title) ? fi.title : ((typeof fi === 'object' && fi?.role) ? fi.role : "Principal Investigator");

      return {
        ...fi,
        faculty: {
          id: typeof fid === 'string' ? fid : (fi?.id || `FAC-${Date.now()}`),
          name: fallbackName,
          department: dept,
          title: title,
          avatar: fallbackName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        },
        facultyName: fallbackName,
        department: dept
      };
    });

    const studentList = (selectedProject.studentsInvolved || []).map(si => {
      const sid = (typeof si === 'object' && si) ? (si.studentId || si.id || si.name || si.studentName) : si;
      const cleanNameCandidate = (typeof si === 'object' && si) ? (si.studentName || si.name) : (typeof si === 'string' && !si.startsWith('STU-') && !si.startsWith('QU-') ? si : '');

      const s = students.find(stu => 
        stu.id === sid || 
        stu.studentId === sid || 
        (cleanNameCandidate && stu.name.toLowerCase() === cleanNameCandidate.toLowerCase()) ||
        (typeof sid === 'string' && stu.name.toLowerCase() === sid.toLowerCase())
      );
      if (s) return { ...si, student: s, studentName: s.name, department: s.department || si.department || 'Computer Science & Engineering' };

      const fallbackName = cleanNameCandidate || (typeof sid === 'string' && !sid.startsWith('STU-') && !sid.startsWith('QU-') ? sid : (typeof si === 'object' && si?.studentName ? si.studentName : (typeof sid === 'string' && sid.startsWith('STU-') ? `Student (${sid})` : "Student Researcher")));
      const dept = (typeof si === 'object' && si?.department) ? si.department : "Computer Science & Engineering";
      const roll = (typeof si === 'object' && (si?.roll || si?.studentId)) ? (si.roll || si.studentId) : (typeof sid === 'string' && sid.startsWith('QU-') ? sid : "QU-2025");

      return {
        ...si,
        student: {
          id: typeof sid === 'string' ? sid : (si?.id || `STU-${Date.now()}`),
          name: fallbackName,
          department: dept,
          studentId: roll,
          avatar: fallbackName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        },
        studentName: fallbackName,
        department: dept
      };
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
              <button
                className="btn btn-secondary"
                onClick={() => setEditingProject(selectedProject)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Edit3 size={15} /> Edit Project & Team
              </button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Faculty Members & Research Leads ({facultyList.length})
            </h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setAddTeammateRoleType('faculty');
                setIsAddTeammateOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <UserPlus size={14} /> + Add Faculty Lead
            </button>
          </div>

          <div className="cards-grid-2">
            {facultyList.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                background: 'var(--bg-surface-subtle)',
                borderRadius: '12px',
                border: '1px dashed var(--border-light)'
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  No faculty leads assigned to this project yet.
                </p>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setAddTeammateRoleType('faculty');
                    setIsAddTeammateOpen(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <UserPlus size={14} /> + Add First Faculty Lead
                </button>
              </div>
            ) : (
              facultyList.map((item, idx) => (
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
                            onConfirm: () => removeProjectParticipant(selectedProject.id, 'faculty', item.facultyId || item.faculty.id)
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
              ))
            )}
          </div>
        </div>

        {/* Student Collaborators */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '1.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Student Research Associates & Engineers ({studentList.length})
            </h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setAddTeammateRoleType('student');
                setIsAddTeammateOpen(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <UserPlus size={14} /> + Add Student Teammate
            </button>
          </div>

          <div className="cards-grid-2">
            {studentList.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--bg-surface-subtle)',
                borderRadius: '12px',
                border: '1px dashed var(--border-light)'
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                  No student research associates assigned to this project.
                </p>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setAddTeammateRoleType('student');
                    setIsAddTeammateOpen(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <UserPlus size={14} /> + Add Student Associate
                </button>
              </div>
            ) : (
              studentList.map((item, idx) => (
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
                            onConfirm: () => removeProjectParticipant(selectedProject.id, 'students', item.studentId || item.student.id)
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
                    Assigned Task: <strong>{item.role || 'Quantum Developer'}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modals for Drilldown View */}
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject}
        />
        <AddTeammateModal
          isOpen={isAddTeammateOpen}
          onClose={() => setIsAddTeammateOpen(false)}
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
          initialRoleType={addTeammateRoleType}
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
                      className="btn-icon"
                      title="Edit Project & Team"
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
                        setEditingProject(project);
                      }}
                    >
                      <Edit3 size={13} />
                    </button>
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

      {/* Modals for List View */}
      <EditProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        project={editingProject}
      />
    </div>
  );
};
