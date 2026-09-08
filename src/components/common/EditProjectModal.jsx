import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Users,
  UserPlus,
  Trash2,
  Save,
  CheckCircle2,
  Building,
  GraduationCap,
  Code2,
  Tag
} from 'lucide-react';
import { useQuantumDB } from '../../data/db';

export const EditProjectModal = ({
  isOpen,
  onClose,
  project
}) => {
  const { faculty, students, updateProject } = useQuantumDB();

  const [formData, setFormData] = useState({
    title: '',
    domain: 'Quantum Machine Learning',
    techStack: '',
    status: 'Active Development',
    githubUrl: '',
    description: '',
    targetAudience: 'students',
    studentsInvolved: [],
    facultyInvolved: []
  });

  const [newMemberType, setNewMemberType] = useState('student');
  const [selectedExistingId, setSelectedExistingId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDept, setNewMemberDept] = useState('Computer Science & Engineering');
  const [newMemberExtra, setNewMemberExtra] = useState(''); // roll or title
  const [newMemberRole, setNewMemberRole] = useState('Quantum Algorithm Developer');

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        title: project.title || '',
        domain: project.domain || 'Quantum Machine Learning',
        techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : (project.techStack || ''),
        status: project.status || 'Active Development',
        githubUrl: project.githubUrl || '',
        description: project.description || '',
        targetAudience: project.targetAudience || 'students',
        studentsInvolved: Array.isArray(project.studentsInvolved) ? [...project.studentsInvolved] : [],
        facultyInvolved: Array.isArray(project.facultyInvolved) ? [...project.facultyInvolved] : []
      });
      setSelectedExistingId('');
      setNewMemberName('');
      setNewMemberExtra('');
      setNewMemberRole('Quantum Algorithm Developer');
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handleRemoveStudent = (studentId) => {
    setFormData(prev => ({
      ...prev,
      studentsInvolved: prev.studentsInvolved.filter(s => String(s.studentId || s) !== String(studentId))
    }));
  };

  const handleRemoveFaculty = (facultyId) => {
    setFormData(prev => ({
      ...prev,
      facultyInvolved: prev.facultyInvolved.filter(f => String(f.facultyId || f) !== String(facultyId))
    }));
  };

  const handleUpdateStudentRole = (studentId, newRole) => {
    setFormData(prev => ({
      ...prev,
      studentsInvolved: prev.studentsInvolved.map(s => {
        if (String(s.studentId || s) === String(studentId)) {
          return typeof s === 'object' ? { ...s, role: newRole } : { studentId: s, role: newRole };
        }
        return s;
      })
    }));
  };

  const handleUpdateFacultyRole = (facultyId, newRole) => {
    setFormData(prev => ({
      ...prev,
      facultyInvolved: prev.facultyInvolved.map(f => {
        if (String(f.facultyId || f) === String(facultyId)) {
          return typeof f === 'object' ? { ...f, role: newRole } : { facultyId: f, role: newRole };
        }
        return f;
      })
    }));
  };

  const handleAddMemberToForm = () => {
    if (newMemberType === 'student') {
      if (selectedExistingId) {
        const alreadyIn = formData.studentsInvolved.some(s => String(s.studentId || s) === String(selectedExistingId));
        if (!alreadyIn) {
          const sObj = students.find(s => s.id === selectedExistingId);
          setFormData(prev => ({
            ...prev,
            studentsInvolved: [
              ...prev.studentsInvolved,
              {
                studentId: selectedExistingId,
                studentName: sObj?.name || '',
                department: sObj?.department || '',
                role: newMemberRole || 'Quantum Developer'
              }
            ]
          }));
        }
        setSelectedExistingId('');
      } else if (newMemberName.trim()) {
        const cleanName = newMemberName.trim();
        const existing = students.find(s => s.name.toLowerCase() === cleanName.toLowerCase());
        if (existing) {
          const alreadyIn = formData.studentsInvolved.some(s => String(s.studentId || s) === String(existing.id));
          if (!alreadyIn) {
            setFormData(prev => ({
              ...prev,
              studentsInvolved: [
                ...prev.studentsInvolved,
                {
                  studentId: existing.id,
                  studentName: existing.name,
                  department: existing.department,
                  role: newMemberRole || 'Quantum Developer'
                }
              ]
            }));
          }
        } else {
          const newStuId = `STU-${Date.now().toString().slice(-4)}`;
          const newStu = {
            id: newStuId,
            name: cleanName,
            department: newMemberDept || 'Computer Science & Engineering',
            studentId: newMemberExtra || `QU-${Math.floor(1000 + Math.random() * 9000)}`,
            avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          };
          setFormData(prev => ({
            ...prev,
            studentsInvolved: [
              ...prev.studentsInvolved,
              {
                studentId: newStuId,
                studentName: cleanName,
                department: newMemberDept,
                role: newMemberRole || 'Quantum Developer'
              }
            ],
            _newStudents: [...(prev._newStudents || []), newStu]
          }));
        }
        setNewMemberName('');
        setNewMemberExtra('');
      }
    } else {
      // Faculty
      if (selectedExistingId) {
        const alreadyIn = formData.facultyInvolved.some(f => String(f.facultyId || f) === String(selectedExistingId));
        if (!alreadyIn) {
          const fObj = faculty.find(f => f.id === selectedExistingId);
          setFormData(prev => ({
            ...prev,
            facultyInvolved: [
              ...prev.facultyInvolved,
              {
                facultyId: selectedExistingId,
                facultyName: fObj?.name || '',
                department: fObj?.department || '',
                role: newMemberRole || 'Faculty Advisor'
              }
            ]
          }));
        }
        setSelectedExistingId('');
      } else if (newMemberName.trim()) {
        const cleanName = newMemberName.trim();
        const existing = faculty.find(f => f.name.toLowerCase() === cleanName.toLowerCase());
        if (existing) {
          const alreadyIn = formData.facultyInvolved.some(f => String(f.facultyId || f) === String(existing.id));
          if (!alreadyIn) {
            setFormData(prev => ({
              ...prev,
              facultyInvolved: [
                ...prev.facultyInvolved,
                {
                  facultyId: existing.id,
                  facultyName: existing.name,
                  department: existing.department,
                  role: newMemberRole || 'Faculty Advisor'
                }
              ]
            }));
          }
        } else {
          const newFacId = `FAC-${Date.now().toString().slice(-4)}`;
          const newFac = {
            id: newFacId,
            name: cleanName,
            department: newMemberDept || 'Physics & Quantum Computing',
            title: newMemberExtra || 'Faculty Advisor',
            avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          };
          setFormData(prev => ({
            ...prev,
            facultyInvolved: [
              ...prev.facultyInvolved,
              {
                facultyId: newFacId,
                facultyName: cleanName,
                department: newMemberDept,
                role: newMemberRole || 'Faculty Advisor'
              }
            ],
            _newFaculty: [...(prev._newFaculty || []), newFac]
          }));
        }
        setNewMemberName('');
        setNewMemberExtra('');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please provide a project title.');
      return;
    }

    const { _newFaculty = [], _newStudents = [], ...cleanData } = formData;

    const parsedTechStack = cleanData.techStack
      ? cleanData.techStack.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    updateProject(
      project.id,
      {
        ...cleanData,
        techStack: parsedTechStack
      },
      _newFaculty,
      _newStudents
    );

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-surface)',
          zIndex: 10
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="metric-pill secondary" style={{ fontSize: '0.75rem' }}>
                {project.id}
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Edit Project & Teammates
              </h3>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Update project specifications, architecture description, code repo, and team member roles
            </p>
          </div>

          <button
            className="btn-icon"
            onClick={onClose}
            title="Close"
            style={{ borderRadius: '50%', padding: '0.4rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem' }}>
          {/* Target Section / Audience Radio Selection */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Target Project Section
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="editProjectTargetAudience"
                  value="students"
                  checked={formData.targetAudience === 'students' || formData.targetAudience === 'student'}
                  onChange={() => setFormData({ ...formData, targetAudience: 'students' })}
                />
                <GraduationCap size={15} style={{ color: 'var(--primary)' }} />
                Student Projects Section
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="editProjectTargetAudience"
                  value="faculty"
                  checked={formData.targetAudience === 'faculty'}
                  onChange={() => setFormData({ ...formData, targetAudience: 'faculty' })}
                />
                <Building size={15} style={{ color: 'var(--secondary)' }} />
                Faculty Projects Section
              </label>
            </div>
          </div>

          {/* Project Title */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Project Title *
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. VLMS: Virtual Lab Management System for Quantum Circuits"
              required
            />
          </div>

          {/* Domain & Status */}
          <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Project Domain / Area
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="e.g. Quantum Machine Learning"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Development Status
              </label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active Development">Active Development</option>
                <option value="Completed & Benchmarked">Completed & Benchmarked</option>
                <option value="Published / In Production">Published / In Production</option>
                <option value="Prototype Phase">Prototype Phase</option>
                <option value="Open Source Release">Open Source Release</option>
              </select>
            </div>
          </div>

          {/* Tech Stack & Github URL */}
          <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Tech Stack (Comma Separated)
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                placeholder="e.g. React, Node.js, Qiskit, Python, Tailwind"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Code Repository / Github URL
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/org/repo-name"
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Project Description & Architecture Overview
            </label>
            <textarea
              className="form-textarea"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of features, modules, compilers, algorithms, and system workflow..."
            ></textarea>
          </div>

          {/* TEAMMATES & ADVISORS MANAGEMENT */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid var(--border-light)',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} />
              Team Members & Advisors Management
            </h4>

            {/* Student Creators & Developers List */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>STUDENT CREATORS & DEVELOPERS ({formData.studentsInvolved.length})</span>
              </div>

              {formData.studentsInvolved.length === 0 ? (
                <div style={{
                  padding: '1rem',
                  background: 'var(--bg-surface)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-light)',
                  color: 'var(--text-muted)',
                  fontSize: '0.84rem',
                  textAlign: 'center'
                }}>
                  No student teammates attached yet. Use the sub-form below to add team members.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {formData.studentsInvolved.map((item, idx) => {
                    const sid = item.studentId || item;
                    const sObj = students.find(s => s.id === sid) || (formData._newStudents || []).find(s => s.id === sid) || { name: item.studentName || sid, department: item.department || 'Student' };
                    const currentRole = item.role || 'Quantum Developer';

                    return (
                      <div
                        key={sid || idx}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.75rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 200px' }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {sObj.avatar || sObj.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{sObj.name}</strong>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {sObj.studentId ? `${sObj.studentId} • ` : ''}{sObj.department}
                            </div>
                          </div>
                        </div>

                        {/* Editable Role Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 220px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Role:</span>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', height: '30px' }}
                            value={currentRole}
                            onChange={(e) => handleUpdateStudentRole(sid, e.target.value)}
                            placeholder="e.g. Project Lead, Frontend Dev"
                          />
                          <button
                            type="button"
                            className="btn-icon-danger"
                            title="Remove Teammate"
                            onClick={() => handleRemoveStudent(sid)}
                            style={{ padding: '4px', flexShrink: 0 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Faculty Advisors List */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>FACULTY RESEARCH MENTORS & ADVISORS ({formData.facultyInvolved.length})</span>
              </div>

              {formData.facultyInvolved.length === 0 ? (
                <div style={{
                  padding: '1rem',
                  background: 'var(--bg-surface)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-light)',
                  color: 'var(--text-muted)',
                  fontSize: '0.84rem',
                  textAlign: 'center'
                }}>
                  No faculty advisors attached. Use the sub-form below to attach mentors.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {formData.facultyInvolved.map((item, idx) => {
                    const fid = item.facultyId || item;
                    const fObj = faculty.find(f => f.id === fid) || (formData._newFaculty || []).find(f => f.id === fid) || { name: item.facultyName || fid, department: item.department || 'Faculty' };
                    const currentRole = item.role || 'Faculty Advisor';

                    return (
                      <div
                        key={fid || idx}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.75rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 200px' }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--secondary-light)',
                            color: 'var(--secondary)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {fObj.avatar || fObj.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{fObj.name}</strong>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{fObj.department}</div>
                          </div>
                        </div>

                        {/* Editable Mentorship Role Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 220px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Mentorship:</span>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem', height: '30px' }}
                            value={currentRole}
                            onChange={(e) => handleUpdateFacultyRole(fid, e.target.value)}
                            placeholder="e.g. Research Mentor & PI"
                          />
                          <button
                            type="button"
                            className="btn-icon-danger"
                            title="Remove Faculty Advisor"
                            onClick={() => handleRemoveFaculty(fid)}
                            style={{ padding: '4px', flexShrink: 0 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Attach Teammate / Advisor Sub-Form */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-medium)',
              borderRadius: '10px',
              padding: '1rem'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserPlus size={15} style={{ color: 'var(--primary)' }} />
                Attach New Teammate / Advisor to Project:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Member Type</label>
                  <select
                    className="form-input"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                    value={newMemberType}
                    onChange={(e) => {
                      setNewMemberType(e.target.value);
                      setSelectedExistingId('');
                      setNewMemberRole(e.target.value === 'student' ? 'Quantum Developer' : 'Faculty Advisor');
                    }}
                  >
                    <option value="student">Student Teammate</option>
                    <option value="faculty">Faculty Advisor</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Select Registered {newMemberType === 'student' ? 'Student' : 'Faculty'} OR Type Below
                  </label>
                  {newMemberType === 'student' ? (
                    <select
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                      value={selectedExistingId}
                      onChange={(e) => {
                        setSelectedExistingId(e.target.value);
                        if (e.target.value) setNewMemberName('');
                      }}
                    >
                      <option value="">-- Choose registered student or enter custom below --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.studentId || s.department})</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                      value={selectedExistingId}
                      onChange={(e) => {
                        setSelectedExistingId(e.target.value);
                        if (e.target.value) setNewMemberName('');
                      }}
                    >
                      <option value="">-- Choose registered faculty or enter custom below --</option>
                      {faculty.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Project Role / Title</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    placeholder={newMemberType === 'student' ? "e.g. Lead Architect" : "e.g. Research PI"}
                  />
                </div>
              </div>

              {!selectedExistingId && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <div>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                      placeholder={newMemberType === 'student' ? "Student Name (e.g. Alex Rivera)" : "Faculty Name (e.g. Dr. John)"}
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                      placeholder="Department"
                      value={newMemberDept}
                      onChange={(e) => setNewMemberDept(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                      placeholder={newMemberType === 'student' ? "Roll No (e.g. QU-2024)" : "Title"}
                      value={newMemberExtra}
                      onChange={(e) => setNewMemberExtra(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddMemberToForm}
                style={{ marginTop: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <UserPlus size={14} /> + Attach Teammate to List
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-light)'
          }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '150px' }}
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
