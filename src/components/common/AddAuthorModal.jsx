import React, { useState } from 'react';
import { X, UserPlus, Users, Building, GraduationCap } from 'lucide-react';
import { useQuantumDB } from '../../data/db';

export const AddAuthorModal = ({
  isOpen,
  onClose,
  paperId,
  paperTitle,
  initialRoleType = 'faculty' // 'faculty' | 'student'
}) => {
  const { faculty, students, addResearchPaperAuthor } = useQuantumDB();

  const [roleType, setRoleType] = useState(initialRoleType);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Physics & Quantum Computing');
  const [extraInfo, setExtraInfo] = useState(''); // title or studentId / roll

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedPersonId) {
      addResearchPaperAuthor(paperId, roleType, selectedPersonId);
      onClose();
      return;
    }

    if (!name.trim()) {
      alert('Please enter the author name or pick an existing researcher.');
      return;
    }

    const cleanName = name.trim();
    const newId = `${roleType === 'faculty' ? 'FAC' : 'STU'}-${Date.now().toString().slice(-4)}`;
    const personData = {
      id: newId,
      name: cleanName,
      department: department || (roleType === 'faculty' ? 'Physics & Quantum Computing' : 'Computer Science & Engineering'),
      title: roleType === 'faculty' ? (extraInfo || 'Faculty Researcher') : undefined,
      studentId: roleType === 'student' ? (extraInfo || `QU-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
      avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    };

    addResearchPaperAuthor(paperId, roleType, newId, personData);
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
              <UserPlus size={18} style={{ color: 'var(--secondary)' }} />
              Add Author to Paper
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {paperTitle ? `"${paperTitle}"` : 'Attach researcher to publication'}
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
          {/* Author Type Selection */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem'
          }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
              Author Role
            </label>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="authorRoleType"
                  value="faculty"
                  checked={roleType === 'faculty'}
                  onChange={() => {
                    setRoleType('faculty');
                    setSelectedPersonId('');
                    setDepartment('Physics & Quantum Computing');
                  }}
                />
                <Building size={14} style={{ color: 'var(--secondary)' }} />
                Faculty Author
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="authorRoleType"
                  value="student"
                  checked={roleType === 'student'}
                  onChange={() => {
                    setRoleType('student');
                    setSelectedPersonId('');
                    setDepartment('Computer Science & Engineering');
                  }}
                />
                <GraduationCap size={14} style={{ color: 'var(--primary)' }} />
                Student Co-Author
              </label>
            </div>
          </div>

          {/* Pick from existing or create new */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Select Registered {roleType === 'faculty' ? 'Faculty' : 'Student'}
            </label>
            {roleType === 'faculty' ? (
              <select
                className="form-input"
                value={selectedPersonId}
                onChange={(e) => {
                  setSelectedPersonId(e.target.value);
                  if (e.target.value) setName('');
                }}
              >
                <option value="">-- Choose from registered faculty or enter manually below --</option>
                {faculty.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
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
                <option value="">-- Choose from registered students or enter manually below --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.studentId || s.department})</option>
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
                Or Add New {roleType === 'faculty' ? 'Faculty' : 'Student'}
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={roleType === 'faculty' ? "e.g. Dr. John Doe" : "e.g. Alex Rivera"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Physics & Quantum Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  {roleType === 'faculty' ? 'Designation / Title' : 'Student Roll Number / ID'}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={roleType === 'faculty' ? "e.g. Professor & Quantum PI" : "e.g. QU-2024-089"}
                  value={extraInfo}
                  onChange={(e) => setExtraInfo(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.25rem',
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
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <UserPlus size={15} /> Add Author to Paper
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
