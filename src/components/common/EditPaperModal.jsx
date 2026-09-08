import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Users,
  UserPlus,
  Trash2,
  Save,
  CheckCircle2,
  Building,
  GraduationCap
} from 'lucide-react';
import { useQuantumDB } from '../../data/db';

export const EditPaperModal = ({
  isOpen,
  onClose,
  paper
}) => {
  const { faculty, students, updateResearchPaper } = useQuantumDB();

  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    doi: '',
    researchArea: '',
    citations: 0,
    date: '',
    abstract: '',
    targetAudience: 'faculty',
    facultyAuthors: [],
    studentAuthors: []
  });

  const [newAuthorRole, setNewAuthorRole] = useState('faculty');
  const [selectedExistingId, setSelectedExistingId] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [newAuthorDept, setNewAuthorDept] = useState('Physics & Quantum Computing');
  const [newAuthorExtra, setNewAuthorExtra] = useState(''); // title or studentId

  useEffect(() => {
    if (paper && isOpen) {
      setFormData({
        title: paper.title || '',
        venue: paper.venue || '',
        doi: paper.doi || '',
        researchArea: paper.researchArea || 'Quantum Algorithms',
        citations: paper.citations ?? 0,
        date: paper.date || new Date().toISOString().slice(0, 10),
        abstract: paper.abstract || '',
        targetAudience: paper.targetAudience || 'faculty',
        facultyAuthors: Array.isArray(paper.facultyAuthors) ? [...paper.facultyAuthors] : [],
        studentAuthors: Array.isArray(paper.studentAuthors) ? [...paper.studentAuthors] : []
      });
      setSelectedExistingId('');
      setNewAuthorName('');
      setNewAuthorExtra('');
    }
  }, [paper, isOpen]);

  if (!isOpen || !paper) return null;

  const handleRemoveFacultyAuthor = (facId) => {
    setFormData(prev => ({
      ...prev,
      facultyAuthors: prev.facultyAuthors.filter(id => String(id) !== String(facId))
    }));
  };

  const handleRemoveStudentAuthor = (stuId) => {
    setFormData(prev => ({
      ...prev,
      studentAuthors: prev.studentAuthors.filter(id => String(id) !== String(stuId))
    }));
  };

  const handleAddAuthorToForm = () => {
    if (newAuthorRole === 'faculty') {
      if (selectedExistingId) {
        if (!formData.facultyAuthors.includes(selectedExistingId)) {
          setFormData(prev => ({
            ...prev,
            facultyAuthors: [...prev.facultyAuthors, selectedExistingId]
          }));
        }
        setSelectedExistingId('');
      } else if (newAuthorName.trim()) {
        const cleanName = newAuthorName.trim();
        const existing = faculty.find(f => f.name.toLowerCase() === cleanName.toLowerCase());
        if (existing) {
          if (!formData.facultyAuthors.includes(existing.id)) {
            setFormData(prev => ({
              ...prev,
              facultyAuthors: [...prev.facultyAuthors, existing.id]
            }));
          }
        } else {
          const newFacId = `FAC-${Date.now().toString().slice(-4)}`;
          const newFac = {
            id: newFacId,
            name: cleanName,
            department: newAuthorDept || 'Physics & Quantum Computing',
            title: newAuthorExtra || 'Faculty Researcher',
            avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          };
          setFormData(prev => ({
            ...prev,
            facultyAuthors: [...prev.facultyAuthors, newFacId],
            _newFaculty: [...(prev._newFaculty || []), newFac]
          }));
        }
        setNewAuthorName('');
        setNewAuthorExtra('');
      }
    } else {
      if (selectedExistingId) {
        if (!formData.studentAuthors.includes(selectedExistingId)) {
          setFormData(prev => ({
            ...prev,
            studentAuthors: [...prev.studentAuthors, selectedExistingId]
          }));
        }
        setSelectedExistingId('');
      } else if (newAuthorName.trim()) {
        const cleanName = newAuthorName.trim();
        const existing = students.find(s => s.name.toLowerCase() === cleanName.toLowerCase());
        if (existing) {
          if (!formData.studentAuthors.includes(existing.id)) {
            setFormData(prev => ({
              ...prev,
              studentAuthors: [...prev.studentAuthors, existing.id]
            }));
          }
        } else {
          const newStuId = `STU-${Date.now().toString().slice(-4)}`;
          const newStu = {
            id: newStuId,
            name: cleanName,
            department: newAuthorDept || 'Computer Science & Engineering',
            studentId: newAuthorExtra || `QU-${Math.floor(1000 + Math.random() * 9000)}`,
            avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
          };
          setFormData(prev => ({
            ...prev,
            studentAuthors: [...prev.studentAuthors, newStuId],
            _newStudents: [...(prev._newStudents || []), newStu]
          }));
        }
        setNewAuthorName('');
        setNewAuthorExtra('');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please provide a paper title.');
      return;
    }

    const { _newFaculty = [], _newStudents = [], ...cleanData } = formData;

    updateResearchPaper(
      paper.id,
      {
        ...cleanData,
        citations: parseInt(cleanData.citations) || 0
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
                {paper.id}
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Edit Research Paper
              </h3>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Modify manuscript metadata, publication details, and author affiliations
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
          {/* Target Section Selection */}
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
                  name="editPaperTargetAudience"
                  value="faculty"
                  checked={formData.targetAudience === 'faculty'}
                  onChange={() => setFormData({ ...formData, targetAudience: 'faculty' })}
                />
                <Building size={15} style={{ color: 'var(--secondary)' }} />
                Faculty Research Papers
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="editPaperTargetAudience"
                  value="students"
                  checked={formData.targetAudience === 'students' || formData.targetAudience === 'student'}
                  onChange={() => setFormData({ ...formData, targetAudience: 'students' })}
                />
                <GraduationCap size={15} style={{ color: 'var(--primary)' }} />
                Student Research Papers
              </label>
            </div>
          </div>

          {/* Paper Title */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Paper Title *
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. ClimateChain: A Quantum-Secured Blockchain Architecture..."
              required
            />
          </div>

          {/* Venue & DOI */}
          <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Journal / Conference Venue *
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. IEEE Transactions on Quantum Engineering"
                required
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                DOI Link / Identifier
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.doi}
                onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                placeholder="e.g. 10.1109/TQE.2026.01234"
              />
            </div>
          </div>

          {/* Research Area, Citations & Date */}
          <div className="form-grid-3" style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Research Area
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.researchArea}
                onChange={(e) => setFormData({ ...formData, researchArea: e.target.value })}
                placeholder="e.g. Quantum Cryptography"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Citations Count
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.citations}
                onChange={(e) => setFormData({ ...formData, citations: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Publication Date
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {/* Abstract */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Abstract
            </label>
            <textarea
              className="form-textarea"
              rows="4"
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              placeholder="Detailed summary of methodology, results, quantum circuit formulations, and experimental conclusions..."
            ></textarea>
          </div>

          {/* Authors Management */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid var(--border-light)',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Users size={17} style={{ color: 'var(--secondary)' }} />
              Manage Authors & Co-Authors
            </h4>

            {/* Current Faculty Authors */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Faculty Authors ({formData.facultyAuthors.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.facultyAuthors.length === 0 ? (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No faculty authors attached</span>
                ) : (
                  formData.facultyAuthors.map(fid => {
                    const fObj = faculty.find(f => f.id === fid) || (formData._newFaculty || []).find(f => f.id === fid) || { name: fid, department: 'Faculty' };
                    return (
                      <span
                        key={fid}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: 'var(--secondary-light)',
                          color: 'var(--secondary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '8px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.82rem',
                          fontWeight: 600
                        }}
                      >
                        <strong>{fObj.name}</strong>
                        {fObj.department && <span style={{ opacity: 0.8, fontSize: '0.74rem' }}>({fObj.department})</span>}
                        <button
                          type="button"
                          onClick={() => handleRemoveFacultyAuthor(fid)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--secondary)',
                            cursor: 'pointer',
                            padding: '0 2px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          title="Remove Faculty Author"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Current Student Co-Authors */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Student Co-Authors ({formData.studentAuthors.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.studentAuthors.length === 0 ? (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No student co-authors attached</span>
                ) : (
                  formData.studentAuthors.map(sid => {
                    const sObj = students.find(s => s.id === sid) || (formData._newStudents || []).find(s => s.id === sid) || { name: sid, department: 'Student' };
                    return (
                      <span
                        key={sid}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '8px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.82rem',
                          fontWeight: 600
                        }}
                      >
                        <strong>{sObj.name}</strong>
                        {(sObj.studentId || sObj.department) && (
                          <span style={{ opacity: 0.8, fontSize: '0.74rem' }}>({sObj.studentId || sObj.department})</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveStudentAuthor(sid)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            padding: '0 2px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                          title="Remove Student Author"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Add New Author / Co-Author Sub-Form */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-medium)',
              borderRadius: '8px',
              padding: '0.85rem 1rem'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserPlus size={14} style={{ color: 'var(--secondary)' }} />
                Add Another Author to This Paper:
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Role Type</label>
                  <select
                    className="form-input"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                    value={newAuthorRole}
                    onChange={(e) => {
                      setNewAuthorRole(e.target.value);
                      setSelectedExistingId('');
                    }}
                  >
                    <option value="faculty">Faculty Author</option>
                    <option value="student">Student Co-Author</option>
                  </select>
                </div>

                <div style={{ flex: '2 1 200px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Select Registered {newAuthorRole === 'faculty' ? 'Faculty' : 'Student'} OR Type Name
                  </label>
                  {newAuthorRole === 'faculty' ? (
                    <select
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem', marginBottom: selectedExistingId ? 0 : '0.35rem' }}
                      value={selectedExistingId}
                      onChange={(e) => {
                        setSelectedExistingId(e.target.value);
                        if (e.target.value) setNewAuthorName('');
                      }}
                    >
                      <option value="">-- Choose from registered faculty or type below --</option>
                      {faculty.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem', marginBottom: selectedExistingId ? 0 : '0.35rem' }}
                      value={selectedExistingId}
                      onChange={(e) => {
                        setSelectedExistingId(e.target.value);
                        if (e.target.value) setNewAuthorName('');
                      }}
                    >
                      <option value="">-- Choose from registered students or type below --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.studentId || s.department})</option>
                      ))}
                    </select>
                  )}

                  {!selectedExistingId && (
                    <input
                      type="text"
                      className="form-input"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                      placeholder={newAuthorRole === 'faculty' ? "Or enter new faculty name (e.g. Dr. John Doe)" : "Or enter new student name (e.g. Jane Doe)"}
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                    />
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddAuthorToForm}
                  style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <UserPlus size={14} /> Attach Author
                </button>
              </div>
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
              className="btn btn-secondary"
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
