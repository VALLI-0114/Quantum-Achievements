import React, { useState } from 'react';
import { X, UserPlus, Users, Building, GraduationCap } from 'lucide-react';
import { useQuantumDB } from '../../data/db';

export const AddTeammateModal = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  initialRoleType = 'student' // 'student' | 'faculty'
}) => {
  const { students, faculty, addProjectParticipant } = useQuantumDB();

  const [roleType, setRoleType] = useState(initialRoleType);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [extraInfo, setExtraInfo] = useState(''); // roll number or faculty designation
  const [projectRole, setProjectRole] = useState('Quantum Algorithm Developer');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedPersonId) {
      const existingPerson = roleType === 'student'
        ? students.find(s => s.id === selectedPersonId)
        : faculty.find(f => f.id === selectedPersonId);

      addProjectParticipant(projectId, roleType, selectedPersonId, {
        studentId: roleType === 'student' ? (existingPerson?.studentId || existingPerson?.id || selectedPersonId) : undefined,
        id: selectedPersonId,
        facultyId: roleType === 'faculty' ? (existingPerson?.id || selectedPersonId) : undefined,
        studentName: existingPerson?.name || '',
        facultyName: existingPerson?.name || '',
        name: existingPerson?.name || '',
        department: existingPerson?.department || department,
        role: projectRole || (roleType === 'student' ? 'Quantum Developer' : 'Faculty Advisor'),
        roll: existingPerson?.studentId || existingPerson?.id
      });
      onClose();
      return;
    }

    if (!name.trim()) {
      alert('Please enter member name or select an existing member.');
      return;
    }

    const cleanName = name.trim();
    const newId = `${roleType === 'student' ? 'STU' : 'FAC'}-${Date.now().toString().slice(-4)}`;
    const personData = {
      id: newId,
      name: cleanName,
      department: department || (roleType === 'student' ? 'Information Technology' : 'Physics & Quantum Computing'),
      studentId: roleType === 'student' ? (extraInfo || `QU-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
      title: roleType === 'faculty' ? (extraInfo || 'Faculty Advisor') : undefined,
      avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    };

    addProjectParticipant(
      projectId,
      roleType,
      newId,
      {
        studentId: personData.studentId || newId,
        id: newId,
        facultyId: roleType === 'faculty' ? newId : undefined,
        studentName: cleanName,
        facultyName: cleanName,
        name: cleanName,
        department: personData.department,
        role: projectRole || (roleType === 'student' ? 'Quantum Developer' : 'Faculty Advisor'),
        roll: personData.studentId
      },
      personData
    );

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1150 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-surface)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserPlus size={18} style={{ color: 'var(--primary)' }} />
              Add Teammate / Advisor
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {projectTitle ? `"${projectTitle}"` : 'Attach collaborator to project'}
            </p>
          </div>

          <button
            className="btn-icon"
            onClick={onClose}
            title="Close"
            style={{ borderRadius: '50%', padding: '0.4rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Role Type Selection */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem'
          }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Member Type
            </label>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="teammateRoleType"
                  value="student"
                  checked={roleType === 'student'}
                  onChange={() => {
                    setRoleType('student');
                    setSelectedPersonId('');
                    setDepartment('Computer Science & Engineering');
                    setProjectRole('Quantum Algorithm Developer');
                  }}
                />
                <GraduationCap size={14} style={{ color: 'var(--primary)' }} />
                Student Teammate / Developer
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="teammateRoleType"
                  value="faculty"
                  checked={roleType === 'faculty'}
                  onChange={() => {
                    setRoleType('faculty');
                    setSelectedPersonId('');
                    setDepartment('Physics & Quantum Computing');
                    setProjectRole('Faculty Advisor & Research Mentor');
                  }}
                />
                <Building size={14} style={{ color: 'var(--secondary)' }} />
                Faculty Advisor
              </label>
            </div>
          </div>

          {/* Select from existing registered profiles */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Select Registered {roleType === 'student' ? 'Student' : 'Faculty'}
            </label>
            {roleType === 'student' ? (
              <select
                className="form-input"
                value={selectedPersonId}
                onChange={(e) => {
                  setSelectedPersonId(e.target.value);
                  if (e.target.value) setName('');
                }}
              >
                <option value="">-- Choose from registered students or type below --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.studentId || s.department})</option>
                ))}
              </select>
            ) : (
              <select
                className="form-input"
                value={selectedPersonId}
                onChange={(e) => {
                  setSelectedPersonId(e.target.value);
                  if (e.target.value) setName('');
                }}
              >
                <option value="">-- Choose from registered faculty or type below --</option>
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                ))}
              </select>
            )}
          </div>

          {!selectedPersonId && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                Or Add New {roleType === 'student' ? 'Student' : 'Faculty'} Profile
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={roleType === 'student' ? "e.g. Alex Rivera" : "e.g. Dr. Emily Davis"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Computer Science & Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  {roleType === 'student' ? 'Student ID / Roll Number' : 'Designation / Title'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={roleType === 'student' ? "e.g. QU-2024-001" : "e.g. Associate Professor"}
                  value={extraInfo}
                  onChange={(e) => setExtraInfo(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Project Role */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Assigned Role on Project
            </label>
            <input
              type="text"
              className="form-input"
              value={projectRole}
              onChange={(e) => setProjectRole(e.target.value)}
              placeholder={roleType === 'student' ? "e.g. Lead Developer & Algorithm Architect" : "e.g. Research Mentor & Principal Investigator"}
              required
            />
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
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <UserPlus size={15} /> + Add to Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
