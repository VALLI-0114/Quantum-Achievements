import React, { useState } from 'react';
import { X, Plus, UserPlus, UploadCloud, FileCheck, User } from 'lucide-react';
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

  // Candidate fields (direct text writing)
  const [personData, setPersonData] = useState({
    name: '',
    department: 'Computer Science & Engineering',
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

    if (!personData.name.trim()) {
      alert(`Please enter ${isStudent ? 'student' : 'faculty'} full name`);
      return;
    }

    const cleanName = personData.name.trim();
    let targetPersonId = '';

    if (isStudent) {
      const existing = students.find(s => s.name.toLowerCase() === cleanName.toLowerCase());
      if (existing) {
        targetPersonId = existing.id;
      } else {
        const newStuId = `STU-${Date.now().toString().slice(-4)}`;
        const createdStudent = {
          id: newStuId,
          name: cleanName,
          department: personData.department,
          studentId: personData.studentId || `QU-${Math.floor(1000 + Math.random() * 9000)}`,
          year: personData.year || 'Student',
          email: personData.email || `${cleanName.toLowerCase().replace(/\s+/g, '.')}@student.quantum-hub.edu`,
          avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        };
        addStudent(createdStudent);
        targetPersonId = newStuId;
      }
    } else {
      const existing = faculty.find(f => f.name.toLowerCase() === cleanName.toLowerCase());
      if (existing) {
        targetPersonId = existing.id;
      } else {
        const newFacId = `FAC-${Date.now().toString().slice(-4)}`;
        const createdFaculty = {
          id: newFacId,
          name: cleanName,
          department: personData.department,
          title: personData.title || 'Faculty Researcher',
          email: personData.email || `${cleanName.toLowerCase().replace(/\s+/g, '.')}@faculty.quantum-hub.edu`,
          avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        };
        addFaculty(createdFaculty);
        targetPersonId = newFacId;
      }
    }

    const effectiveGrade = completionData.grade?.trim() || 'Completed / Verified';
    const effectiveCertId = completionData.certificateId?.trim() || `QHUB-${isStudent ? 'STU' : 'FAC'}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Add completion to Course or Certificate
    if (isCourse) {
      addCourseCompletion(entityId, isStudent ? 'students' : 'faculty', targetPersonId, {
        completionDate: completionData.completionDate,
        grade: effectiveGrade,
        certificateId: effectiveCertId,
        uploadedFile: completionData.uploadedFile
      });
    } else {
      addCertificateRecipient(entityId, isStudent ? 'students' : 'faculty', targetPersonId, {
        issueDate: completionData.completionDate,
        score: effectiveGrade,
        credentialId: effectiveCertId,
        uploadedFile: completionData.uploadedFile
      });
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
            {/* Person Information Writing Section */}
            <div style={{
              background: isStudent ? '#F8FAFC' : '#FAF5FF',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <h4 style={{ fontSize: '0.95rem', color: isStudent ? 'var(--primary)' : 'var(--secondary)', marginBottom: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} />
                {isStudent ? 'Student Candidate Details' : 'Faculty Member Details'}
              </h4>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">{isStudent ? 'Student Full Name' : 'Faculty Full Name'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={isStudent ? 'e.g. Alex Rivera' : 'e.g. Dr. Sarah Lin'}
                    value={personData.name}
                    onChange={(e) => setPersonData({ ...personData, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{isStudent ? 'Roll Number / Student ID' : 'Designation / Faculty ID'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={isStudent ? 'e.g. QU-2026-0199' : 'e.g. Associate Professor'}
                    value={isStudent ? personData.studentId : personData.title}
                    onChange={(e) => setPersonData({ ...personData, [isStudent ? 'studentId' : 'title']: e.target.value })}
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
                    value={personData.department}
                    onChange={(e) => setPersonData({ ...personData, department: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{isStudent ? 'Year / Academic Standing' : 'Institutional Email'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={isStudent ? 'e.g. 4th Year B.Tech' : 'e.g. sarah.lin@quantum-hub.edu'}
                    value={isStudent ? personData.year : personData.email}
                    onChange={(e) => setPersonData({ ...personData, [isStudent ? 'year' : 'email']: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Achievement Roster & Certificate Details */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              padding: '1.25rem'
            }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.85rem', fontWeight: 700 }}>
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
                  <label className="form-label">Grade / Distinction Score (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 98% (Distinction) or Pass"
                    value={completionData.grade}
                    onChange={(e) => setCompletionData({ ...completionData, grade: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Certificate Credential ID (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. QHUB-CERT-993012"
                  value={completionData.certificateId}
                  onChange={(e) => setCompletionData({ ...completionData, certificateId: e.target.value })}
                />
              </div>

              {/* Certificate File Attachment */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                  <UploadCloud size={15} style={{ color: isStudent ? 'var(--primary)' : 'var(--secondary)' }} />
                  Attach Certificate File (PDF / Image) (Optional)
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
