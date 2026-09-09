import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Users,
  UserPlus,
  Trash2,
  Save,
  CheckCircle2,
  Building,
  GraduationCap
} from 'lucide-react';
import { useQuantumDB } from '../../data/db';

export const EditHackathonModal = ({
  isOpen,
  onClose,
  hackathon
}) => {
  const { faculty, students, updateHackathon } = useQuantumDB();

  const [formData, setFormData] = useState({
    name: '',
    organizer: '',
    edition: '',
    date: '',
    targetAudience: 'students',
    studentParticipants: [],
    facultyParticipants: []
  });

  const [newMemberType, setNewMemberType] = useState('student');
  const [selectedExistingId, setSelectedExistingId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDept, setNewMemberDept] = useState('Computer Science & Engineering');
  const [newMemberExtra, setNewMemberExtra] = useState(''); // roll or title
  const [newMemberAward, setNewMemberAward] = useState('🏆 1st Place Winner');
  const [newMemberTeam, setNewMemberTeam] = useState('Quantum Innovators');
  const [newMemberProject, setNewMemberProject] = useState('');

  useEffect(() => {
    if (hackathon && isOpen) {
      setFormData({
        name: hackathon.name || '',
        organizer: hackathon.organizer || '',
        edition: hackathon.edition || '',
        date: hackathon.date || '',
        targetAudience: hackathon.targetAudience || 'students',
        studentParticipants: Array.isArray(hackathon.studentParticipants) ? [...hackathon.studentParticipants] : [],
        facultyParticipants: Array.isArray(hackathon.facultyParticipants) ? [...hackathon.facultyParticipants] : []
      });
      setSelectedExistingId('');
      setNewMemberName('');
      setNewMemberExtra('');
      setNewMemberProject('');
    }
  }, [hackathon, isOpen]);

  if (!isOpen || !hackathon) return null;

  const isStudentAudience = formData.targetAudience === 'students' || formData.targetAudience === 'student';

  const handleRemoveStudent = (studentId) => {
    setFormData(prev => ({
      ...prev,
      studentParticipants: prev.studentParticipants.filter(s => String(s.studentId || s.id || s) !== String(studentId))
    }));
  };

  const handleRemoveFaculty = (facultyId) => {
    setFormData(prev => ({
      ...prev,
      facultyParticipants: prev.facultyParticipants.filter(f => String(f.facultyId || f.id || f) !== String(facultyId))
    }));
  };

  const handleAddMemberToForm = () => {
    if (isStudentAudience) {
      if (selectedExistingId) {
        const sObj = students.find(s => s.id === selectedExistingId);
        setFormData(prev => ({
          ...prev,
          studentParticipants: [
            ...prev.studentParticipants,
            {
              studentId: selectedExistingId,
              studentName: sObj?.name || '',
              name: sObj?.name || '',
              department: sObj?.department || 'Computer Science & Engineering',
              teamName: newMemberTeam || '—',
              projectBuilt: newMemberProject || '—',
              award: newMemberAward || 'Winner',
              rank: 'Winner'
            }
          ]
        }));
        setSelectedExistingId('');
      } else if (newMemberName.trim()) {
        const cleanName = newMemberName.trim();
        const existing = students.find(s => s.name.toLowerCase() === cleanName.toLowerCase());
        if (existing) {
          setFormData(prev => ({
            ...prev,
            studentParticipants: [
              ...prev.studentParticipants,
              {
                studentId: existing.id,
                studentName: existing.name,
                name: existing.name,
                department: existing.department || newMemberDept,
                teamName: newMemberTeam || '—',
                projectBuilt: newMemberProject || '—',
                award: newMemberAward || 'Winner',
                rank: 'Winner'
              }
            ]
          }));
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
            studentParticipants: [
              ...prev.studentParticipants,
              {
                studentId: newStuId,
                studentName: cleanName,
                name: cleanName,
                department: newMemberDept || 'Computer Science & Engineering',
                teamName: newMemberTeam || '—',
                projectBuilt: newMemberProject || '—',
                award: newMemberAward || 'Winner',
                rank: 'Winner'
              }
            ],
            _newStudents: [...(prev._newStudents || []), newStu]
          }));
        }
        setNewMemberName('');
        setNewMemberExtra('');
      }
    } else {
      if (selectedExistingId) {
        const fObj = faculty.find(f => f.id === selectedExistingId);
        setFormData(prev => ({
          ...prev,
          facultyParticipants: [
            ...prev.facultyParticipants,
            {
              facultyId: selectedExistingId,
              facultyName: fObj?.name || '',
              name: fObj?.name || '',
              department: fObj?.department || 'Physics & Quantum Computing',
              teamName: newMemberTeam || '—',
              projectBuilt: newMemberProject || '—',
              role: 'Faculty Mentor & Judge',
              award: newMemberAward || 'Participant'
            }
          ]
        }));
        setSelectedExistingId('');
      } else if (newMemberName.trim()) {
        const cleanName = newMemberName.trim();
        const existing = faculty.find(f => f.name.toLowerCase() === cleanName.toLowerCase());
        if (existing) {
          setFormData(prev => ({
            ...prev,
            facultyParticipants: [
              ...prev.facultyParticipants,
              {
                facultyId: existing.id,
                facultyName: existing.name,
                name: existing.name,
                department: existing.department || newMemberDept,
                teamName: newMemberTeam || '—',
                projectBuilt: newMemberProject || '—',
                role: 'Faculty Mentor & Judge',
                award: newMemberAward || 'Participant'
              }
            ]
          }));
        } else {
          const newFacId = `FAC-${Date.now().toString().slice(-4)}`;
          const newFac = {
            id: newFacId,
            name: cleanName,
            department: newMemberDept || 'Physics & Quantum Computing',
            title: newMemberExtra || 'Faculty Mentor',
            avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          };
          setFormData(prev => ({
            ...prev,
            facultyParticipants: [
              ...prev.facultyParticipants,
              {
                facultyId: newFacId,
                facultyName: cleanName,
                name: cleanName,
                department: newMemberDept || 'Physics & Quantum Computing',
                teamName: newMemberTeam || '—',
                projectBuilt: newMemberProject || '—',
                role: 'Faculty Mentor & Judge',
                award: newMemberAward || 'Participant'
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

    if (!formData.name.trim()) {
      alert('Please enter hackathon name.');
      return;
    }

    const { _newFaculty = [], _newStudents = [], ...cleanData } = formData;

    updateHackathon(
      hackathon.id,
      cleanData,
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
        style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}
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
                {hackathon.id}
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Edit Hackathon & Team Roster
              </h3>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Modify event details, organizer, dates, and all team members (up to 6+ members)
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
          {/* Target Section */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
              Target Section / Audience
            </label>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="editHackathonTargetAudience"
                  value="students"
                  checked={isStudentAudience}
                  onChange={() => setFormData({ ...formData, targetAudience: 'students' })}
                />
                <GraduationCap size={15} style={{ color: 'var(--primary)' }} />
                Student Hackathons
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="editHackathonTargetAudience"
                  value="faculty"
                  checked={!isStudentAudience}
                  onChange={() => setFormData({ ...formData, targetAudience: 'faculty' })}
                />
                <Building size={15} style={{ color: 'var(--secondary)' }} />
                Faculty Hackathons & Mentorship
              </label>
            </div>
          </div>

          {/* Hackathon Name */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Hackathon / Challenge Name *
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. MIT iQuHACK Quantum Hackathon"
              required
            />
          </div>

          {/* Organizer, Edition, Date */}
          <div className="form-grid-3" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Organizer</label>
              <input
                type="text"
                className="form-input"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="e.g. MIT & IBM Quantum"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Edition / Track</label>
              <input
                type="text"
                className="form-input"
                value={formData.edition}
                onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                placeholder="e.g. 2026 Global Edition"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Date</label>
              <input
                type="text"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="e.g. February 2026"
              />
            </div>
          </div>

          {/* Participants & Teams Management */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid var(--border-light)',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Trophy size={18} style={{ color: 'var(--primary)' }} />
              Team Roster & Placements ({isStudentAudience ? formData.studentParticipants.length : formData.facultyParticipants.length})
            </h4>

            {isStudentAudience ? (
              formData.studentParticipants.length === 0 ? (
                <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px dashed var(--border-light)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '1rem' }}>
                  No student participants recorded yet. Add team members below.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {formData.studentParticipants.map((sp, idx) => {
                    const sid = sp.studentId || sp.id || sp;
                    const sObj = students.find(s => s.id === sid || s.studentId === sid || (sp.studentName && s.name.toLowerCase() === sp.studentName.toLowerCase())) || (formData._newStudents || []).find(s => s.id === sid) || { name: sp.studentName || sp.name || sid, department: sp.department || 'CSE' };
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
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{sObj.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {sObj.studentId || sp.studentId || 'QU-2026'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                            {sp.award || 'Winner'} • Team: {sp.teamName || '—'} • Project: {sp.projectBuilt || '—'}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => handleRemoveStudent(sid)}
                          style={{ padding: '4px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              formData.facultyParticipants.length === 0 ? (
                <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px dashed var(--border-light)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '1rem' }}>
                  No faculty participants recorded yet. Add faculty mentors/members below.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {formData.facultyParticipants.map((fp, idx) => {
                    const fid = fp.facultyId || fp.id || fp;
                    const fObj = faculty.find(f => f.id === fid || (fp.facultyName && f.name.toLowerCase() === fp.facultyName.toLowerCase())) || (formData._newFaculty || []).find(f => f.id === fid) || { name: fp.facultyName || fp.name || fid, department: fp.department || 'Physics' };
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
                        <div>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{fObj.name}</strong>
                          <div style={{ fontSize: '0.76rem', color: 'var(--secondary)', fontWeight: 600, marginTop: '2px' }}>
                            {fp.award || 'Participant'} • Team: {fp.teamName || '—'} • Project: {fp.projectBuilt || '—'}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => handleRemoveFaculty(fid)}
                          style={{ padding: '4px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Sub-form */}
            <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-medium)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserPlus size={14} style={{ color: 'var(--primary)' }} />
                Add Team Member / Winner (Max 6+ Members):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Select Existing</label>
                  {isStudentAudience ? (
                    <select
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                      value={selectedExistingId}
                      onChange={(e) => {
                        setSelectedExistingId(e.target.value);
                        if (e.target.value) setNewMemberName('');
                      }}
                    >
                      <option value="">-- Choose registered student --</option>
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
                      <option value="">-- Choose registered faculty --</option>
                      {faculty.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                      ))}
                    </select>
                  )}
                </div>

                {!selectedExistingId && (
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Or Enter Name</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                      placeholder={isStudentAudience ? "Student Full Name" : "Faculty Full Name"}
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                    />
                  </div>
                )}

                {!selectedExistingId && (
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {isStudentAudience ? 'Student ID / Roll' : 'Title / Designation'}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                      placeholder={isStudentAudience ? "e.g. QU-8270" : "e.g. Mentor / PI"}
                      value={newMemberExtra}
                      onChange={(e) => setNewMemberExtra(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Team Name <span style={{ fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                    placeholder="e.g. Team 3 (Optional)"
                    value={newMemberTeam}
                    onChange={(e) => setNewMemberTeam(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Project Built <span style={{ fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                    placeholder="Project Solution (Optional)"
                    value={newMemberProject}
                    onChange={(e) => setNewMemberProject(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Position & Award Won</label>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                    placeholder="e.g. Top 3 at JNTU-GV"
                    value={newMemberAward}
                    onChange={(e) => setNewMemberAward(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAddMemberToForm}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}
              >
                <UserPlus size={13} /> + Attach Team Member
              </button>
            </div>
          </div>

          {/* Footer */}
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
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: '140px' }}
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
