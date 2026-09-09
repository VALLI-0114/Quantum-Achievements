import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Trophy, GraduationCap, Building } from 'lucide-react';
import { useQuantumDB } from '../../data/db';

export const AddHackathonMemberModal = ({
  isOpen,
  onClose,
  hackathonId,
  hackathonName,
  initialTeamName = '',
  initialAward = '',
  initialProject = '',
  roleType = 'student' // 'student' | 'faculty'
}) => {
  const { students, faculty, addHackathonParticipant } = useQuantumDB();

  const isStudent = roleType === 'student';

  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Information Technology');
  const [extraInfo, setExtraInfo] = useState(''); // studentId/roll or designation
  const [teamName, setTeamName] = useState(initialTeamName || 'Team 1');
  const [projectBuilt, setProjectBuilt] = useState(initialProject || '');
  const [award, setAward] = useState(initialAward || 'Winner');
  const [teamRole, setTeamRole] = useState('Team Member');

  useEffect(() => {
    if (isOpen) {
      setTeamName(initialTeamName || 'Team 1');
      setAward(initialAward || 'Winner');
      setProjectBuilt(initialProject || '');
      setSelectedPersonId('');
      setName('');
      setExtraInfo('');
      setTeamRole('Team Member');
    }
  }, [isOpen, initialTeamName, initialAward, initialProject]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanTeam = teamName.trim() || 'Team 1';
    const cleanAward = award.trim() || 'Winner';
    const cleanProject = projectBuilt.trim() || '—';

    if (selectedPersonId) {
      const existingPerson = isStudent
        ? students.find(s => s.id === selectedPersonId)
        : faculty.find(f => f.id === selectedPersonId);

      addHackathonParticipant(hackathonId, roleType, selectedPersonId, {
        studentId: isStudent ? (existingPerson?.studentId || existingPerson?.id) : undefined,
        facultyId: !isStudent ? existingPerson?.id : undefined,
        studentName: existingPerson?.name || '',
        facultyName: existingPerson?.name || '',
        name: existingPerson?.name || '',
        department: existingPerson?.department || department,
        teamName: cleanTeam,
        projectBuilt: cleanProject,
        award: cleanAward,
        role: teamRole || 'Team Member',
        rank: 'Winner'
      });

      onClose();
      return;
    }

    if (!name.trim()) {
      alert(`Please enter the ${isStudent ? 'student' : 'faculty'} member's name.`);
      return;
    }

    const cleanName = name.trim();
    const newId = `${isStudent ? 'STU' : 'FAC'}-${Date.now().toString().slice(-4)}`;
    const personData = {
      id: newId,
      name: cleanName,
      department: department || 'Information Technology',
      studentId: isStudent ? (extraInfo || `QU-${Math.floor(1000 + Math.random() * 9000)}`) : undefined,
      title: !isStudent ? (extraInfo || 'Faculty Mentor') : undefined,
      avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    };

    addHackathonParticipant(
      hackathonId,
      roleType,
      newId,
      {
        studentName: cleanName,
        facultyName: cleanName,
        name: cleanName,
        department: department,
        studentId: personData.studentId,
        teamName: cleanTeam,
        projectBuilt: cleanProject,
        award: cleanAward,
        role: teamRole || 'Team Member',
        rank: 'Winner'
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
        style={{ maxWidth: '580px', padding: 0, overflow: 'hidden' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span className="metric-pill primary" style={{ fontSize: '0.75rem' }}>
                {cleanTeamHeader(teamName)}
              </span>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Add Team Member
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {hackathonName ? `Event: "${hackathonName}"` : 'Attach member to team roster'}
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
          {/* Team Association */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={14} /> Team & Award Information
            </div>

            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Team Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Team 3, Team 1, etc."
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Position / Award Won</label>
                <input
                  type="text"
                  className="form-input"
                  value={award}
                  onChange={(e) => setAward(e.target.value)}
                  placeholder="e.g. Top 3 at JNTU-GV"
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: '0.75rem 0 0' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                Project Solution Built <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={projectBuilt}
                onChange={(e) => setProjectBuilt(e.target.value)}
                placeholder="e.g. Quantum Error Mitigation Pipeline (Optional)"
              />
            </div>
          </div>

          {/* Member Details */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {isStudent ? <GraduationCap size={15} style={{ color: 'var(--primary)' }} /> : <Building size={15} style={{ color: 'var(--secondary)' }} />}
              {isStudent ? 'Student Member Details' : 'Faculty Member Details'}
            </div>

            {/* Select existing registered student */}
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                Select Registered {isStudent ? 'Student' : 'Faculty'}
              </label>
              {isStudent ? (
                <select
                  className="form-input"
                  value={selectedPersonId}
                  onChange={(e) => {
                    setSelectedPersonId(e.target.value);
                    if (e.target.value) setName('');
                  }}
                >
                  <option value="">-- Choose from existing students or enter below --</option>
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
                  <option value="">-- Choose from existing faculty or enter below --</option>
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Manual input if not selecting existing */}
            {!selectedPersonId && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={isStudent ? "e.g. M. Tejasathvika" : "e.g. Dr. John Doe"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      {isStudent ? 'Roll / Student ID' : 'Designation / Title'}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={isStudent ? "e.g. QU-8270" : "e.g. Associate Professor"}
                      value={extraInfo}
                      onChange={(e) => setExtraInfo(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>Department</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Information Technology"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.75rem',
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
              <UserPlus size={16} /> Add to {teamName || 'Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const cleanTeamHeader = (t) => {
  if (!t || !t.trim()) return 'Team Member';
  return t.trim();
};
