import React, { useState } from 'react';
import { X, Plus, UserPlus, UploadCloud, FileCheck, CheckCircle2, User, Award, BookOpen } from 'lucide-react';
import { useQuantumDB } from '../../data/db';

export const AddParticipantModal = ({
  isOpen,
  onClose,
  targetType = 'course', // 'course' | 'certificate'
  audienceType = 'student', // 'student' | 'faculty'
  entityId,
  entityTitle,
  entityCode
}) => {
  const {
    students,
    faculty,
    addStudent,
    addFaculty,
    addCourseCompletion,
    addCertificateRecipient
  } = useQuantumDB();

  const isStudent = audienceType === 'student';
  const isCourse = targetType === 'course';

  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [selectedPersonId, setSelectedPersonId] = useState('');
  
  // New candidate fields
  const [newPerson, setNewPerson] = useState({
    name: '',
    department: 'Information Technology',
    studentId: `QU-2026-${Math.floor(100 + Math.random() * 900)}`,
    year: '4th Year B.Tech',
    title: 'Assistant Professor',
    email: ''
  });

  // Completion / Recipient details
  const [completionData, setCompletionData] = useState({
    completionDate: new Date().toISOString().slice(0, 10),
    grade: '98% (Distinction)',
    certificateId: `QHUB-${isStudent ? 'STU' : 'FAC'}-${Math.floor(1000 + Math.random() * 9000)}`,
    uploadedFile: null
  });

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCompletionData(prev => ({
        ...prev,
        uploadedFile: {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type,
          dataUrl: event.target.result
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let targetPersonId = selectedPersonId;

    // If creating a brand new person
    if (mode === 'new') {
      if (!newPerson.name.trim()) {
        alert('Please enter candidate full name');
        return;
      }

      if (isStudent) {
        const newStuId = `STU-${Date.now().toString().slice(-4)}`;
        const createdStudent = {
          id: newStuId,
          name: newPerson.name,
          department: newPerson.department,
          studentId: newPerson.studentId,
          year: newPerson.year,
          email: newPerson.email || `${newPerson.name.toLowerCase().replace(/\s+/g, '.')}@student.quantum-hub.edu`,
          highestHonor: 'Quantum Certified Candidate',
          quantumSpecialization: 'Quantum Algorithms & NISQ'
        };
        addStudent(createdStudent);
        targetPersonId = newStuId;
      } else {
        const newFacId = `FAC-${Date.now().toString().slice(-4)}`;
        const createdFaculty = {
          id: newFacId,
          name: newPerson.name,
          department: newPerson.department,
          title: newPerson.title || 'Professor',
          email: newPerson.email || `${newPerson.name.toLowerCase().replace(/\s+/g, '.')}@faculty.quantum-hub.edu`,
          highestHonor: 'Senior Quantum Fellow',
          quantumSpecialization: 'Quantum Information & Architecture'
        };
        addFaculty(createdFaculty);
        targetPersonId = newFacId;
      }
    } else {
      if (!selectedPersonId) {
        alert(`Please select a ${isStudent ? 'student' : 'faculty member'} from the list`);
        return;
      }
    }

    // Add completion to Course or Certificate
    if (isCourse) {
      addCourseCompletion(entityId, isStudent ? 'students' : 'faculty', targetPersonId, {
        completionDate: completionData.completionDate,
        grade: completionData.grade,
        certificateId: completionData.certificateId,
        uploadedFile: completionData.uploadedFile
      });
      alert(`Successfully registered ${isStudent ? 'Student' : 'Faculty'} completion for ${entityCode || entityTitle}!`);
    } else {
      addCertificateRecipient(entityId, isStudent ? 'students' : 'faculty', targetPersonId, {
        issueDate: completionData.completionDate,
        score: completionData.grade,
        credentialId: completionData.certificateId,
        uploadedFile: completionData.uploadedFile
      });
      alert(`Successfully added ${isStudent ? 'Student' : 'Faculty'} recipient to certificate ${entityTitle}!`);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              background: isStudent ? '#EFF6FF' : '#F5F3FF',
              color: isStudent ? 'var(--primary)' : 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>
                Add {isStudent ? 'Student' : 'Faculty'} to {isCourse ? 'Course Completion Roster' : 'Certificate Recipient List'}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Target: <strong>{entityCode ? `${entityCode}: ` : ''}{entityTitle}</strong>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {/* Mode Toggle: Existing vs New */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '1.25rem',
              background: 'var(--bg-surface-subtle)',
              padding: '0.4rem',
              borderRadius: '10px',
              border: '1px solid var(--border-light)'
            }}>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'existing' ? (isStudent ? 'btn-primary' : 'btn-secondary') : 'btn-outline'}`}
                style={{ flex: 1, border: 'none' }}
                onClick={() => setMode('existing')}
              >
                <User size={14} /> Select Registered {isStudent ? 'Student' : 'Faculty'}
              </button>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'new' ? (isStudent ? 'btn-primary' : 'btn-secondary') : 'btn-outline'}`}
                style={{ flex: 1, border: 'none' }}
                onClick={() => setMode('new')}
              >
                <UserPlus size={14} /> ➕ Register & Add New {isStudent ? 'Student' : 'Faculty'}
              </button>
            </div>

            {/* Mode 1: Select Existing Candidate */}
            {mode === 'existing' ? (
              <div className="form-group">
                <label className="form-label">
                  Select {isStudent ? 'Student Candidate' : 'Faculty Member'}
                </label>
                <select
                  className="form-select"
                  value={selectedPersonId}
                  onChange={(e) => setSelectedPersonId(e.target.value)}
                  required
                >
                  <option value="">-- Choose {isStudent ? 'Student' : 'Faculty Member'} --</option>
                  {isStudent
                    ? students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.studentId}) — {s.department} [{s.year || 'Student'}]
                        </option>
                      ))
                    : faculty.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.title}) — {f.department}
                        </option>
                      ))
                  }
                </select>
              </div>
            ) : (
              /* Mode 2: Add Brand New Candidate */
              <div style={{
                background: isStudent ? '#F8FAFC' : '#FAF5FF',
                border: '1px solid var(--border-light)',
                borderRadius: '10px',
                padding: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <h4 style={{ fontSize: '0.9rem', color: isStudent ? 'var(--primary)' : 'var(--secondary)', marginBottom: '0.75rem', fontWeight: 700 }}>
                  New {isStudent ? 'Student Candidate' : 'Faculty Member'} Information
                </h4>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. S. Harini"
                      value={newPerson.name}
                      onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isStudent ? 'Roll Number / Student ID' : 'Designation / Title'}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={isStudent ? 'e.g. QU-2026-0199' : 'e.g. Associate Professor'}
                      value={isStudent ? newPerson.studentId : newPerson.title}
                      onChange={(e) => setNewPerson({ ...newPerson, [isStudent ? 'studentId' : 'title']: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Academic Department</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Information Technology / Computer Science"
                      value={newPerson.department}
                      onChange={(e) => setNewPerson({ ...newPerson, department: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isStudent ? 'Year / Academic Standing' : 'Institutional Email'}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={isStudent ? 'e.g. 4th Year B.Tech' : 'faculty@quantum-hub.edu'}
                      value={isStudent ? newPerson.year : newPerson.email}
                      onChange={(e) => setNewPerson({ ...newPerson, [isStudent ? 'year' : 'email']: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Achievement Roster Details */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: '10px',
              padding: '1.25rem',
              marginTop: '0.5rem'
            }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem', fontWeight: 700 }}>
                Completion & Verification Credentials
              </h4>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Completion / Verification Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={completionData.completionDate}
                    onChange={(e) => setCompletionData({ ...completionData, completionDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Grade / Distinction Score</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 98% (Distinction)"
                    value={completionData.grade}
                    onChange={(e) => setCompletionData({ ...completionData, grade: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Certificate Credential ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={completionData.certificateId}
                  onChange={(e) => setCompletionData({ ...completionData, certificateId: e.target.value })}
                  required
                />
              </div>

              {/* Certificate File Attachment */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                  <UploadCloud size={15} style={{ color: isStudent ? 'var(--primary)' : 'var(--secondary)' }} />
                  Attach Certificate File (PDF / Image)
                </label>

                {!completionData.uploadedFile ? (
                  <label className="file-upload-zone" style={{ padding: '0.85rem 1rem' }}>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/jpg"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                    <UploadCloud size={24} style={{ color: isStudent ? 'var(--primary)' : 'var(--secondary)' }} />
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Click to attach certificate document
                    </div>
                  </label>
                ) : (
                  <div className="file-preview-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileCheck size={18} style={{ color: 'var(--accent-teal)' }} />
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{completionData.uploadedFile.name}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{completionData.uploadedFile.size}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setCompletionData(prev => ({ ...prev, uploadedFile: null }))}
                      style={{ color: 'var(--accent-rose)', borderColor: 'var(--accent-rose-border)', padding: '0.25rem 0.6rem' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`btn ${isStudent ? 'btn-primary' : 'btn-secondary'}`}>
              <Plus size={16} /> Add {isStudent ? 'Student' : 'Faculty'} to {isCourse ? 'Course' : 'Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
