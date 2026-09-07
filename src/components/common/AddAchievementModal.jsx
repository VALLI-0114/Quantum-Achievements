import React, { useState, useEffect } from 'react';
import { X, Plus, BookOpen, Award, Layers, FileText, Trophy, Sparkles, UploadCloud, FileCheck, Paperclip } from 'lucide-react';
import { useQuantumDB } from '../../data/db';

export const AddAchievementModal = ({
  isOpen,
  onClose,
  targetCategory = 'courses',
  targetAudience = 'faculty'
}) => {
  const {
    faculty,
    students,
    addCourse,
    addCertificate,
    addProject,
    addResearchPaper,
    addHackathon
  } = useQuantumDB();

  const [activeTab, setActiveTab] = useState(targetCategory);
  const [audience, setAudience] = useState(targetAudience);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setActiveTab(targetCategory || 'courses');
      setAudience(targetAudience || 'faculty');
    }
  }, [isOpen, targetCategory, targetAudience]);

  // 1. Course State
  const [courseForm, setCourseForm] = useState({
    code: 'QC-205',
    name: '',
    provider: 'IBM Quantum Network & Q-HUB',
    category: 'Quantum Algorithms',
    description: '',
    selectedPersonId: '',
    completionDate: new Date().toISOString().slice(0, 10),
    grade: 'Distinction',
    uploadedFile: null
  });

  // 2. Certificate State (with file upload)
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: 'IBM Quantum & Q-HUB',
    code: 'QISKIT-PRO-2026',
    verificationUrl: 'https://www.credly.com',
    selectedPersonId: '',
    issueDate: new Date().toISOString().slice(0, 10),
    credentialId: `QHUB-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
    score: 'Mastery',
    uploadedFile: null
  });

  // 3. Project State
  const [projectForm, setProjectForm] = useState({
    title: '',
    domain: 'Quantum Machine Learning',
    techStack: 'Qiskit, PennyLane, Python, PyTorch',
    description: '',
    status: 'Active Development',
    githubUrl: 'https://github.com/quantum-hub',
    leadFacultyId: 'FAC-001',
    leadStudentId: 'STU-001',
    uploadedFile: null
  });

  // 4. Research Paper State
  const [paperForm, setPaperForm] = useState({
    title: '',
    venue: 'IEEE Transactions on Quantum Engineering',
    doi: '10.1109/TQE.2026.01234',
    researchArea: 'Quantum Algorithms',
    abstract: '',
    citations: 0,
    date: new Date().toISOString().slice(0, 10),
    facultyAuthorId: 'FAC-001',
    studentAuthorId: 'STU-001'
  });

  // 5. Hackathon State
  const [hackathonForm, setHackathonForm] = useState({
    name: '',
    organizer: 'MIT Center for Quantum Engineering & IBM',
    edition: '2026 Global Edition',
    date: 'February 2026',
    teamName: '',
    projectBuilt: '',
    award: '🏆 1st Place - Quantum Computing Challenge',
    selectedPersonId: '',
    repoUrl: 'https://github.com/quantum-hub'
  });

  // File upload handler
  const handleFileUpload = (formType, file) => {
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB limit. Please upload a file smaller than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type,
        dataUrl: event.target.result
      };

      if (formType === 'certificates') {
        setCertForm(prev => ({ ...prev, uploadedFile: fileData }));
      } else if (formType === 'courses') {
        setCourseForm(prev => ({ ...prev, uploadedFile: fileData }));
      } else if (formType === 'hackathons') {
        setHackathonForm(prev => ({ ...prev, uploadedFile: fileData }));
      } else if (formType === 'projects') {
        setProjectForm(prev => ({ ...prev, uploadedFile: fileData }));
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeTab === 'courses') {
      if (!courseForm.name) return alert('Please enter the course name');
      const newCourseId = `CRS-${Date.now().toString().slice(-4)}`;
      const newCourse = {
        id: newCourseId,
        code: courseForm.code || 'QC-101',
        name: courseForm.name,
        provider: courseForm.provider,
        category: courseForm.category,
        description: courseForm.description,
        uploadedFile: courseForm.uploadedFile,
        facultyCompletions: audience === 'faculty' && courseForm.selectedPersonId ? [{
          facultyId: courseForm.selectedPersonId,
          completionDate: courseForm.completionDate,
          certificateId: `CERT-${Date.now().toString().slice(-4)}`,
          grade: courseForm.grade,
          uploadedFile: courseForm.uploadedFile
        }] : [],
        facultyEnrolled: [],
        studentCompletions: audience === 'students' && courseForm.selectedPersonId ? [{
          studentId: courseForm.selectedPersonId,
          completionDate: courseForm.completionDate,
          certificateId: `CERT-${Date.now().toString().slice(-4)}`,
          grade: courseForm.grade,
          uploadedFile: courseForm.uploadedFile
        }] : [],
        studentEnrolled: []
      };
      addCourse(newCourse);
      alert(`Quantum Course achievement added to ${audience === 'faculty' ? 'Faculty' : 'Student'} section!`);
    } else if (activeTab === 'certificates') {
      if (!certForm.title) return alert('Please enter the certificate title');
      const newCert = {
        id: `CERT-${Date.now().toString().slice(-4)}`,
        title: certForm.title,
        issuer: certForm.issuer,
        code: certForm.code,
        verificationUrl: certForm.verificationUrl,
        uploadedFile: certForm.uploadedFile,
        facultyRecipients: audience === 'faculty' && certForm.selectedPersonId ? [{
          facultyId: certForm.selectedPersonId,
          issueDate: certForm.issueDate,
          credentialId: certForm.credentialId,
          score: certForm.score,
          uploadedFile: certForm.uploadedFile
        }] : [],
        studentRecipients: audience === 'students' && certForm.selectedPersonId ? [{
          studentId: certForm.selectedPersonId,
          issueDate: certForm.issueDate,
          credentialId: certForm.credentialId,
          score: certForm.score,
          uploadedFile: certForm.uploadedFile
        }] : []
      };
      addCertificate(newCert);
      alert(`Certificate achievement ${certForm.uploadedFile ? 'with uploaded certificate document' : ''} added to ${audience === 'faculty' ? 'Faculty' : 'Student'} section!`);
    } else if (activeTab === 'projects') {
      if (!projectForm.title) return alert('Please enter project title');
      addProject({
        title: projectForm.title,
        domain: projectForm.domain,
        techStack: projectForm.techStack.split(',').map(s => s.trim()),
        description: projectForm.description,
        status: projectForm.status,
        githubUrl: projectForm.githubUrl,
        uploadedFile: projectForm.uploadedFile,
        facultyInvolved: projectForm.leadFacultyId ? [{ facultyId: projectForm.leadFacultyId, role: 'Principal Investigator' }] : [],
        studentsInvolved: projectForm.leadStudentId ? [{ studentId: projectForm.leadStudentId, role: 'Lead Developer' }] : []
      });
      alert('Quantum Project record created!');
    } else if (activeTab === 'papers') {
      if (!paperForm.title) return alert('Please enter publication title');
      addResearchPaper({
        title: paperForm.title,
        venue: paperForm.venue,
        doi: paperForm.doi,
        citations: parseInt(paperForm.citations) || 0,
        date: paperForm.date,
        researchArea: paperForm.researchArea,
        abstract: paperForm.abstract,
        facultyAuthors: paperForm.facultyAuthorId ? [paperForm.facultyAuthorId] : [],
        studentAuthors: paperForm.studentAuthorId ? [paperForm.studentAuthorId] : []
      });
      alert('Research Publication registered!');
    } else if (activeTab === 'hackathons') {
      if (!hackathonForm.name) return alert('Please enter hackathon name');
      addHackathon({
        name: hackathonForm.name,
        organizer: hackathonForm.organizer,
        edition: hackathonForm.edition,
        date: hackathonForm.date,
        facultyParticipants: audience === 'faculty' && hackathonForm.selectedPersonId ? [{
          facultyId: hackathonForm.selectedPersonId,
          teamName: hackathonForm.teamName || 'Faculty Q-Lab',
          projectBuilt: hackathonForm.projectBuilt || 'Quantum Algorithm Solution',
          award: hackathonForm.award,
          rank: 'Winner'
        }] : [],
        studentParticipants: audience === 'students' && hackathonForm.selectedPersonId ? [{
          studentId: hackathonForm.selectedPersonId,
          teamName: hackathonForm.teamName || 'Student Q-Team',
          projectBuilt: hackathonForm.projectBuilt || 'Quantum Algorithm Solution',
          award: hackathonForm.award,
          rank: 'Winner'
        }] : []
      });
      alert(`Hackathon achievement added to ${audience === 'faculty' ? 'Faculty' : 'Student'} section!`);
    }

    onClose();
  };

  const getCategoryTitle = () => {
    switch (activeTab) {
      case 'courses': return 'Course Achievement';
      case 'certificates': return 'Certificate Achievement';
      case 'projects': return 'Quantum Project';
      case 'papers': return 'Research Paper';
      case 'hackathons': return 'Hackathon & Contest';
      default: return 'Achievement Record';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plus size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Add {getCategoryTitle()}</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Targeting: <strong>{audience === 'faculty' ? 'Faculty Achievements' : 'Student Achievements'}</strong>
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Category Navigation Bar inside Modal */}
        <div className="modal-category-tabs">
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'courses' ? (audience === 'faculty' ? 'active purple' : 'active') : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen size={15} /> Courses
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'certificates' ? (audience === 'faculty' ? 'active purple' : 'active') : ''}`}
            onClick={() => setActiveTab('certificates')}
          >
            <Award size={15} /> Certificates
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'projects' ? (audience === 'faculty' ? 'active purple' : 'active') : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <Layers size={15} /> Projects
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'papers' ? (audience === 'faculty' ? 'active purple' : 'active') : ''}`}
            onClick={() => setActiveTab('papers')}
          >
            <FileText size={15} /> Research Papers
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'hackathons' ? (audience === 'faculty' ? 'active purple' : 'active') : ''}`}
            onClick={() => setActiveTab('hackathons')}
          >
            <Trophy size={15} /> Hackathons
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {/* Target Audience Switcher */}
            {(activeTab === 'courses' || activeTab === 'certificates' || activeTab === 'hackathons') && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                marginBottom: '1.25rem',
                background: audience === 'faculty' ? '#F5F3FF' : '#EFF6FF',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                border: `1px solid ${audience === 'faculty' ? '#DDD6FE' : '#BFDBFE'}`
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Target Section:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: audience === 'faculty' ? 700 : 500 }}>
                  <input
                    type="radio"
                    name="targetAudience"
                    checked={audience === 'faculty'}
                    onChange={() => setAudience('faculty')}
                  />
                  Faculty Achievements
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: audience === 'students' ? 700 : 500 }}>
                  <input
                    type="radio"
                    name="targetAudience"
                    checked={audience === 'students'}
                    onChange={() => setAudience('students')}
                  />
                  Student Achievements
                </label>
              </div>
            )}

            {/* TAB 1: COURSES FORM */}
            {activeTab === 'courses' && (
              <>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Course Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                      placeholder="e.g. QC-305"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category / Domain</label>
                    <input
                      type="text"
                      className="form-input"
                      value={courseForm.category}
                      onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                      placeholder="e.g. Quantum AI / Algorithms"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Course Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    placeholder="e.g. Advanced Variational Quantum Algorithms & QAOA"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Accrediting Provider</label>
                  <input
                    type="text"
                    className="form-input"
                    value={courseForm.provider}
                    onChange={(e) => setCourseForm({ ...courseForm, provider: e.target.value })}
                    placeholder="e.g. IBM Quantum Network & Q-HUB"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Course Description</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="Brief outline of syllabus, quantum gates, and hardware..."
                  ></textarea>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                    Register Initial Completer ({audience === 'faculty' ? 'Faculty Member' : 'Student Candidate'})
                  </h4>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Select Completer</label>
                      <select
                        className="form-select"
                        value={courseForm.selectedPersonId}
                        onChange={(e) => setCourseForm({ ...courseForm, selectedPersonId: e.target.value })}
                      >
                        <option value="">-- Select Member --</option>
                        {audience === 'faculty'
                          ? faculty.map(f => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)
                          : students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>)
                        }
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Completion Grade / Distinction</label>
                      <input
                        type="text"
                        className="form-input"
                        value={courseForm.grade}
                        onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value })}
                        placeholder="e.g. Distinction / 98%"
                      />
                    </div>
                  </div>

                  {/* Course File Upload */}
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                      <UploadCloud size={16} style={{ color: 'var(--primary)' }} />
                      Upload Course Completion Certificate / Marksheet (Optional)
                    </label>

                    {!courseForm.uploadedFile ? (
                      <label className="file-upload-zone" style={{ padding: '0.85rem 1rem' }}>
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/jpg"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileUpload('courses', e.target.files?.[0])}
                        />
                        <UploadCloud size={24} style={{ color: 'var(--primary)' }} />
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Attach Course Completion Certificate / Scorecard
                        </div>
                      </label>
                    ) : (
                      <div className="file-preview-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <FileCheck size={18} style={{ color: 'var(--primary)' }} />
                          <div>
                            <strong style={{ fontSize: '0.85rem' }}>{courseForm.uploadedFile.name}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{courseForm.uploadedFile.size}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setCourseForm(prev => ({ ...prev, uploadedFile: null }))}
                          style={{ color: 'var(--accent-rose)', borderColor: 'var(--accent-rose-border)', padding: '0.25rem 0.6rem' }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: CERTIFICATES FORM */}
            {activeTab === 'certificates' && (
              <>
                <div className="form-group">
                  <label className="form-label">Certificate Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={certForm.title}
                    onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                    placeholder="e.g. Qiskit Certified Quantum Developer Associate"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Issuing Body</label>
                    <input
                      type="text"
                      className="form-input"
                      value={certForm.issuer}
                      onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                      placeholder="e.g. IBM Quantum"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Certificate Code / Credential ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={certForm.credentialId}
                      onChange={(e) => setCertForm({ ...certForm, credentialId: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Assign Recipient ({audience === 'faculty' ? 'Faculty' : 'Student'})</label>
                    <select
                      className="form-select"
                      value={certForm.selectedPersonId}
                      onChange={(e) => setCertForm({ ...certForm, selectedPersonId: e.target.value })}
                    >
                      <option value="">-- Select Recipient --</option>
                      {audience === 'faculty'
                        ? faculty.map(f => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)
                        : students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>)
                      }
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={certForm.issueDate}
                      onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* File Upload / Certificate Document Attachment */}
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                    <UploadCloud size={16} style={{ color: 'var(--primary)' }} />
                    Upload Certificate Document / PDF / Image
                  </label>

                  {!certForm.uploadedFile ? (
                    <label className="file-upload-zone">
                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/jpg"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload('certificates', e.target.files?.[0])}
                      />
                      <UploadCloud size={30} style={{ color: 'var(--primary)' }} />
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Click or Drop Certificate Document (PDF, PNG, JPG)
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Attach verified official PDF certificate, credential scan, or badge (Max 8MB)
                      </div>
                    </label>
                  ) : (
                    <div className="file-preview-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: '8px',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileCheck size={20} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {certForm.uploadedFile.name}
                          </strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {certForm.uploadedFile.size} • <span style={{ color: 'var(--accent-teal)', fontWeight: 700 }}>✓ Document Attached</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setCertForm(prev => ({ ...prev, uploadedFile: null }))}
                        style={{ color: 'var(--accent-rose)', borderColor: 'var(--accent-rose-border)', padding: '0.35rem 0.75rem' }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB 3: PROJECTS FORM */}
            {activeTab === 'projects' && (
              <>
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="e.g. Quantum Error Mitigation in NISQ Processors"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Domain</label>
                    <input
                      type="text"
                      className="form-input"
                      value={projectForm.domain}
                      onChange={(e) => setProjectForm({ ...projectForm, domain: e.target.value })}
                      placeholder="e.g. Quantum Cryptography"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tech Stack (comma-separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={projectForm.techStack}
                      onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                      placeholder="e.g. Qiskit, PennyLane, Python"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Abstract / Details</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Describe algorithm, simulation benchmarks, and results..."
                  ></textarea>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Faculty Lead / Advisor</label>
                    <select
                      className="form-select"
                      value={projectForm.leadFacultyId}
                      onChange={(e) => setProjectForm({ ...projectForm, leadFacultyId: e.target.value })}
                    >
                      {faculty.map(f => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lead Student Researcher</label>
                    <select
                      className="form-select"
                      value={projectForm.leadStudentId}
                      onChange={(e) => setProjectForm({ ...projectForm, leadStudentId: e.target.value })}
                    >
                      {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.department})</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* TAB 4: RESEARCH PAPERS FORM */}
            {activeTab === 'papers' && (
              <>
                <div className="form-group">
                  <label className="form-label">Paper Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={paperForm.title}
                    onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
                    placeholder="e.g. Scalable Surface Code Decoders on FPGA Hardware"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Journal / Conference Venue</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paperForm.venue}
                      onChange={(e) => setPaperForm({ ...paperForm, venue: e.target.value })}
                      placeholder="e.g. Physical Review Applied (APS)"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">DOI Link</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paperForm.doi}
                      onChange={(e) => setPaperForm({ ...paperForm, doi: e.target.value })}
                      placeholder="10.1103/PhysRevApplied..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Abstract</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={paperForm.abstract}
                    onChange={(e) => setPaperForm({ ...paperForm, abstract: e.target.value })}
                    placeholder="Summary of mathematical foundations, methods, and quantum simulation data..."
                  ></textarea>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Faculty Author</label>
                    <select
                      className="form-select"
                      value={paperForm.facultyAuthorId}
                      onChange={(e) => setPaperForm({ ...paperForm, facultyAuthorId: e.target.value })}
                    >
                      {faculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Student Co-Author</label>
                    <select
                      className="form-select"
                      value={paperForm.studentAuthorId}
                      onChange={(e) => setPaperForm({ ...paperForm, studentAuthorId: e.target.value })}
                    >
                      {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* TAB 5: HACKATHONS FORM */}
            {activeTab === 'hackathons' && (
              <>
                <div className="form-group">
                  <label className="form-label">Hackathon / Competition Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={hackathonForm.name}
                    onChange={(e) => setHackathonForm({ ...hackathonForm, name: e.target.value })}
                    placeholder="e.g. MIT iQuHACK Global Quantum Hackathon 2026"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Organizer / Sponsor</label>
                    <input
                      type="text"
                      className="form-input"
                      value={hackathonForm.organizer}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, organizer: e.target.value })}
                      placeholder="e.g. MIT CQE & IBM Quantum"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Edition / Season</label>
                    <input
                      type="text"
                      className="form-input"
                      value={hackathonForm.edition}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, edition: e.target.value })}
                      placeholder="e.g. 2026 Global Edition"
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Team Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={hackathonForm.teamName}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, teamName: e.target.value })}
                      placeholder="e.g. Q-Innovators Alpha"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Position & Award Won</label>
                    <input
                      type="text"
                      className="form-input"
                      value={hackathonForm.award}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, award: e.target.value })}
                      placeholder="e.g. 🏆 1st Place - Quantum Track"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Project Built / Solution Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={hackathonForm.projectBuilt}
                    onChange={(e) => setHackathonForm({ ...hackathonForm, projectBuilt: e.target.value })}
                    placeholder="e.g. Real-Time Quantum Error Mitigation VQE Pipeline"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Lead Participant ({audience === 'faculty' ? 'Faculty Member' : 'Student Candidate'})</label>
                    <select
                      className="form-select"
                      value={hackathonForm.selectedPersonId}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, selectedPersonId: e.target.value })}
                    >
                      <option value="">-- Select Member --</option>
                      {audience === 'faculty'
                        ? faculty.map(f => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)
                        : students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.studentId})</option>)
                      }
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date / Month</label>
                    <input
                      type="text"
                      className="form-input"
                      value={hackathonForm.date}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, date: e.target.value })}
                      placeholder="e.g. February 2026"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Save {getCategoryTitle()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
