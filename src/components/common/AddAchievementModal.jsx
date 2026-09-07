import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  BookOpen,
  Award,
  Layers,
  FileText,
  Trophy,
  UploadCloud,
  FileCheck,
  User,
  Users,
  Trash2,
  Sparkles,
  UserPlus
} from 'lucide-react';
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
    completerName: '',
    completerDept: 'Computer Science & Engineering',
    completerId: '',
    completionDate: new Date().toISOString().slice(0, 10),
    grade: 'Distinction / 98%',
    uploadedFile: null
  });

  // 2. Certificate State
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: 'IBM Quantum & Q-HUB',
    code: 'QISKIT-PRO-2026',
    verificationUrl: 'https://www.credly.com',
    recipientName: '',
    recipientDept: 'Computer Science & Engineering',
    recipientId: '',
    issueDate: new Date().toISOString().slice(0, 10),
    credentialId: `QHUB-CERT-${Math.floor(100000 + Math.random() * 900000)}`,
    score: 'Mastery / 95%',
    uploadedFile: null
  });

  // 3. Project State with Leader and Teammates
  const [projectForm, setProjectForm] = useState({
    title: '',
    domain: 'Quantum Machine Learning',
    techStack: 'Qiskit, PennyLane, Python, PyTorch',
    description: '',
    status: 'Active Development',
    githubUrl: 'https://github.com/quantum-hub',
    // Student Leader
    leadStudentName: '',
    leadStudentRoll: '',
    leadStudentDept: 'Computer Science & Engineering',
    leadStudentRole: 'Project Lead & Quantum Developer',
    // Faculty Advisor
    facultyLeadName: '',
    facultyLeadDept: 'Department of Physics & Quantum Science',
    facultyLeadRole: 'Principal Investigator / Research Advisor',
    // Dynamic Teammates list
    teammates: [],
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
    // Primary Faculty Author
    facultyAuthorName: '',
    facultyAuthorDept: 'Physics & Quantum Computing',
    // Primary Student Author
    studentAuthorName: '',
    studentAuthorRoll: '',
    studentAuthorDept: 'Computer Science & Engineering',
    // Additional Co-authors
    additionalAuthors: []
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
    // Team Leader
    leadName: '',
    leadId: '',
    leadDept: 'Computer Science & Engineering',
    // Dynamic Teammates
    teammates: [],
    repoUrl: 'https://github.com/quantum-hub',
    uploadedFile: null
  });

  // Helper to add a teammate in Project
  const handleAddProjectTeammate = () => {
    setProjectForm(prev => ({
      ...prev,
      teammates: [
        ...prev.teammates,
        {
          id: `tmp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: '',
          studentId: '',
          department: 'Computer Science & Engineering',
          role: 'Quantum Algorithm Developer'
        }
      ]
    }));
  };

  const handleUpdateProjectTeammate = (index, field, value) => {
    setProjectForm(prev => {
      const updated = [...prev.teammates];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, teammates: updated };
    });
  };

  const handleRemoveProjectTeammate = (index) => {
    setProjectForm(prev => ({
      ...prev,
      teammates: prev.teammates.filter((_, idx) => idx !== index)
    }));
  };

  // Helper to add a teammate in Hackathon
  const handleAddHackathonTeammate = () => {
    setHackathonForm(prev => ({
      ...prev,
      teammates: [
        ...prev.teammates,
        {
          id: `tmp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: '',
          studentId: '',
          department: 'Computer Science & Engineering',
          role: 'Team Member'
        }
      ]
    }));
  };

  const handleUpdateHackathonTeammate = (index, field, value) => {
    setHackathonForm(prev => {
      const updated = [...prev.teammates];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, teammates: updated };
    });
  };

  const handleRemoveHackathonTeammate = (index) => {
    setHackathonForm(prev => ({
      ...prev,
      teammates: prev.teammates.filter((_, idx) => idx !== index)
    }));
  };

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

    const newFacultyList = [];
    const newStudentsList = [];

    const getOrMakeStudent = (name, dept, roll, email) => {
      if (!name || !name.trim()) return null;
      const cleanName = name.trim();
      const existing = students.find(s => s.name.toLowerCase() === cleanName.toLowerCase());
      if (existing) return existing.id;
      const newId = `STU-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
      const newStudent = {
        id: newId,
        name: cleanName,
        studentId: roll || `QU-${Math.floor(1000 + Math.random() * 9000)}`,
        department: dept || 'Computer Science & Engineering',
        email: email || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.quantum.edu`,
        avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      };
      newStudentsList.push(newStudent);
      return newId;
    };

    const getOrMakeFaculty = (name, dept, title, email) => {
      if (!name || !name.trim()) return null;
      const cleanName = name.trim();
      const existing = faculty.find(f => f.name.toLowerCase() === cleanName.toLowerCase());
      if (existing) return existing.id;
      const newId = `FAC-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
      const newFac = {
        id: newId,
        name: cleanName,
        title: title || 'Faculty Researcher & Mentor',
        department: dept || 'Physics & Quantum Computing',
        email: email || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@faculty.quantum.edu`,
        avatar: cleanName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      };
      newFacultyList.push(newFac);
      return newId;
    };

    if (activeTab === 'courses') {
      if (!courseForm.name) return alert('Please enter the course name');

      let completerId = null;
      if (courseForm.completerName) {
        if (audience === 'faculty') {
          completerId = getOrMakeFaculty(courseForm.completerName, courseForm.completerDept, 'Faculty Member');
        } else {
          completerId = getOrMakeStudent(courseForm.completerName, courseForm.completerDept, courseForm.completerId);
        }
      }

      const newCourseId = `CRS-${Date.now().toString().slice(-4)}`;
      const newCourse = {
        id: newCourseId,
        code: courseForm.code || 'QC-101',
        name: courseForm.name,
        provider: courseForm.provider,
        category: courseForm.category,
        description: courseForm.description,
        uploadedFile: courseForm.uploadedFile,
        facultyCompletions: audience === 'faculty' && completerId ? [{
          facultyId: completerId,
          facultyName: courseForm.completerName,
          completionDate: courseForm.completionDate,
          certificateId: `CERT-${Date.now().toString().slice(-4)}`,
          grade: courseForm.grade,
          uploadedFile: courseForm.uploadedFile
        }] : [],
        facultyEnrolled: [],
        studentCompletions: audience === 'students' && completerId ? [{
          studentId: completerId,
          studentName: courseForm.completerName,
          completionDate: courseForm.completionDate,
          certificateId: `CERT-${Date.now().toString().slice(-4)}`,
          grade: courseForm.grade,
          uploadedFile: courseForm.uploadedFile
        }] : [],
        studentEnrolled: []
      };
      addCourse(newCourse, newFacultyList, newStudentsList);
    } else if (activeTab === 'certificates') {
      if (!certForm.title) return;

      let recipientId = null;
      if (certForm.recipientName) {
        if (audience === 'faculty') {
          recipientId = getOrMakeFaculty(certForm.recipientName, certForm.recipientDept, 'Certified Faculty Researcher');
        } else {
          recipientId = getOrMakeStudent(certForm.recipientName, certForm.recipientDept, certForm.recipientId);
        }
      }

      const newCert = {
        id: `CERT-${Date.now().toString().slice(-4)}`,
        title: certForm.title,
        issuer: certForm.issuer,
        code: certForm.code,
        verificationUrl: certForm.verificationUrl,
        uploadedFile: certForm.uploadedFile,
        facultyRecipients: audience === 'faculty' && recipientId ? [{
          facultyId: recipientId,
          facultyName: certForm.recipientName,
          issueDate: certForm.issueDate,
          credentialId: certForm.credentialId,
          score: certForm.score,
          uploadedFile: certForm.uploadedFile
        }] : [],
        studentRecipients: audience === 'students' && recipientId ? [{
          studentId: recipientId,
          studentName: certForm.recipientName,
          issueDate: certForm.issueDate,
          credentialId: certForm.credentialId,
          score: certForm.score,
          uploadedFile: certForm.uploadedFile
        }] : []
      };
      addCertificate(newCert, newFacultyList, newStudentsList);
    } else if (activeTab === 'projects') {
      if (!projectForm.title) return;

      // Process Faculty Lead
      const facInvolved = [];
      if (projectForm.facultyLeadName && projectForm.facultyLeadName.trim()) {
        const facId = getOrMakeFaculty(
          projectForm.facultyLeadName,
          projectForm.facultyLeadDept,
          'Research Advisor'
        );
        if (facId) {
          facInvolved.push({
            facultyId: facId,
            facultyName: projectForm.facultyLeadName.trim(),
            role: projectForm.facultyLeadRole || 'Research Advisor & PI',
            department: projectForm.facultyLeadDept
          });
        }
      }

      // Process Student Lead & Teammates
      const stuInvolved = [];
      if (projectForm.leadStudentName && projectForm.leadStudentName.trim()) {
        const leadStuId = getOrMakeStudent(
          projectForm.leadStudentName,
          projectForm.leadStudentDept,
          projectForm.leadStudentRoll
        );
        if (leadStuId) {
          stuInvolved.push({
            studentId: leadStuId,
            studentName: projectForm.leadStudentName.trim(),
            role: projectForm.leadStudentRole || 'Project Lead',
            department: projectForm.leadStudentDept
          });
        }
      }

      // Process additional teammates
      (projectForm.teammates || []).forEach(t => {
        if (t.name && t.name.trim()) {
          const tId = getOrMakeStudent(t.name, t.department, t.studentId);
          if (tId) {
            stuInvolved.push({
              studentId: tId,
              studentName: t.name.trim(),
              role: t.role || 'Quantum Developer',
              department: t.department
            });
          }
        }
      });

      addProject({
        title: projectForm.title,
        domain: projectForm.domain,
        techStack: projectForm.techStack.split(',').map(s => s.trim()).filter(Boolean),
        description: projectForm.description,
        status: projectForm.status,
        githubUrl: projectForm.githubUrl,
        uploadedFile: projectForm.uploadedFile,
        facultyInvolved: facInvolved,
        studentsInvolved: stuInvolved
      }, newFacultyList, newStudentsList);
    } else if (activeTab === 'papers') {
      if (!paperForm.title) return;

      const facAuthors = [];
      if (paperForm.facultyAuthorName && paperForm.facultyAuthorName.trim()) {
        const fId = getOrMakeFaculty(paperForm.facultyAuthorName, paperForm.facultyAuthorDept, 'Faculty Author');
        if (fId) facAuthors.push(fId);
      }

      const stuAuthors = [];
      if (paperForm.studentAuthorName && paperForm.studentAuthorName.trim()) {
        const sId = getOrMakeStudent(paperForm.studentAuthorName, paperForm.studentAuthorDept, paperForm.studentAuthorRoll);
        if (sId) stuAuthors.push(sId);
      }

      addResearchPaper({
        title: paperForm.title,
        venue: paperForm.venue,
        doi: paperForm.doi,
        citations: parseInt(paperForm.citations) || 0,
        date: paperForm.date,
        researchArea: paperForm.researchArea,
        abstract: paperForm.abstract,
        facultyAuthors: facAuthors,
        studentAuthors: stuAuthors
      }, newFacultyList, newStudentsList);
    } else if (activeTab === 'hackathons') {
      if (!hackathonForm.name) return;

      const facParticipants = [];
      const stuParticipants = [];

      if (hackathonForm.leadName && hackathonForm.leadName.trim()) {
        if (audience === 'faculty') {
          const fId = getOrMakeFaculty(hackathonForm.leadName, hackathonForm.leadDept, 'Hackathon Mentor');
          if (fId) {
            facParticipants.push({
              facultyId: fId,
              facultyName: hackathonForm.leadName.trim(),
              teamName: hackathonForm.teamName || 'Faculty Q-Team',
              projectBuilt: hackathonForm.projectBuilt || 'Quantum Algorithm Solution',
              award: hackathonForm.award,
              rank: 'Winner'
            });
          }
        } else {
          const sId = getOrMakeStudent(hackathonForm.leadName, hackathonForm.leadDept, hackathonForm.leadId);
          if (sId) {
            stuParticipants.push({
              studentId: sId,
              studentName: hackathonForm.leadName.trim(),
              teamName: hackathonForm.teamName || 'Student Q-Team',
              projectBuilt: hackathonForm.projectBuilt || 'Quantum Algorithm Solution',
              award: hackathonForm.award,
              rank: 'Winner'
            });
          }
        }
      }

      // Add extra teammates
      (hackathonForm.teammates || []).forEach(t => {
        if (t.name && t.name.trim()) {
          if (audience === 'faculty') {
            const fId = getOrMakeFaculty(t.name, t.department, 'Hackathon Mentor');
            if (fId) {
              facParticipants.push({
                facultyId: fId,
                facultyName: t.name.trim(),
                teamName: hackathonForm.teamName || 'Faculty Q-Team',
                projectBuilt: hackathonForm.projectBuilt || 'Quantum Algorithm Solution',
                award: hackathonForm.award,
                rank: 'Winner'
              });
            }
          } else {
            const sId = getOrMakeStudent(t.name, t.department, t.studentId);
            if (sId) {
              stuParticipants.push({
                studentId: sId,
                studentName: t.name.trim(),
                teamName: hackathonForm.teamName || 'Student Q-Team',
                projectBuilt: hackathonForm.projectBuilt || 'Quantum Algorithm Solution',
                award: hackathonForm.award,
                rank: 'Winner'
              });
            }
          }
        }
      });

      addHackathon({
        name: hackathonForm.name,
        organizer: hackathonForm.organizer,
        edition: hackathonForm.edition,
        date: hackathonForm.date,
        facultyParticipants: facParticipants,
        studentParticipants: stuParticipants
      }, newFacultyList, newStudentsList);
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
                Directly enter details, leaders, and team members below
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

                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-light)',
                  marginTop: '1rem'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={16} style={{ color: 'var(--primary)' }} />
                    Register Course Completer ({audience === 'faculty' ? 'Faculty Member' : 'Student Candidate'})
                  </h4>

                  <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Completer Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={courseForm.completerName}
                        onChange={(e) => setCourseForm({ ...courseForm, completerName: e.target.value })}
                        placeholder="e.g. Alex Rivera"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">{audience === 'faculty' ? 'Employee / Faculty ID' : 'Student ID / Roll No'}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={courseForm.completerId}
                        onChange={(e) => setCourseForm({ ...courseForm, completerId: e.target.value })}
                        placeholder={audience === 'faculty' ? 'e.g. FAC-102' : 'e.g. QU-2024-055'}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-input"
                        value={courseForm.completerDept}
                        onChange={(e) => setCourseForm({ ...courseForm, completerDept: e.target.value })}
                        placeholder="e.g. Information Technology"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Completion Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={courseForm.completionDate}
                        onChange={(e) => setCourseForm({ ...courseForm, completionDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Grade / Distinction</label>
                      <input
                        type="text"
                        className="form-input"
                        value={courseForm.grade}
                        onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value })}
                        placeholder="e.g. 98% (Distinction)"
                      />
                    </div>
                  </div>

                  {/* Course File Upload */}
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                      <UploadCloud size={16} style={{ color: 'var(--primary)' }} />
                      Upload Course Certificate / Scorecard (Optional)
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
                          Click or Drag to Attach PDF / Image Certificate
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

                {/* Recipient Details */}
                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-light)',
                  marginBottom: '1.25rem'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={16} style={{ color: 'var(--primary)' }} />
                    Recipient Details ({audience === 'faculty' ? 'Faculty Member' : 'Student Candidate'})
                  </h4>

                  <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Recipient Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={certForm.recipientName}
                        onChange={(e) => setCertForm({ ...certForm, recipientName: e.target.value })}
                        placeholder="e.g. Sarah Lin"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">{audience === 'faculty' ? 'Employee / Faculty ID' : 'Student ID / Roll No'}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={certForm.recipientId}
                        onChange={(e) => setCertForm({ ...certForm, recipientId: e.target.value })}
                        placeholder={audience === 'faculty' ? 'e.g. FAC-088' : 'e.g. QU-2024-088'}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-input"
                        value={certForm.recipientDept}
                        onChange={(e) => setCertForm({ ...certForm, recipientDept: e.target.value })}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Issue Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={certForm.issueDate}
                        onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Score / Level</label>
                      <input
                        type="text"
                        className="form-input"
                        value={certForm.score}
                        onChange={(e) => setCertForm({ ...certForm, score: e.target.value })}
                        placeholder="e.g. Mastery / 98%"
                      />
                    </div>
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
                        Attach verified official PDF certificate or badge (Max 8MB)
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
                      placeholder="e.g. Quantum Cryptography / QML"
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
                      placeholder="e.g. Qiskit, PennyLane, Python, PyTorch"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Abstract / Project Description</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    placeholder="Describe algorithm architecture, quantum circuit gates, benchmarks, and findings..."
                  ></textarea>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Project Status</label>
                    <select
                      className="form-select"
                      value={projectForm.status}
                      onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    >
                      <option value="Active Development">Active Development</option>
                      <option value="Completed & Validated">Completed & Validated</option>
                      <option value="Research Prototype">Research Prototype</option>
                      <option value="Hardware Benchmarked">Hardware Benchmarked</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub Repository / Source URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={projectForm.githubUrl}
                      onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>

                {/* 1. STUDENT LEADER SECTION */}
                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-light)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={16} /> Lead Student Researcher / Team Leader
                    </h4>
                    {students.length > 0 && (
                      <select
                        style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem', borderRadius: '6px' }}
                        onChange={(e) => {
                          const found = students.find(s => s.id === e.target.value);
                          if (found) {
                            setProjectForm(prev => ({
                              ...prev,
                              leadStudentName: found.name,
                              leadStudentRoll: found.studentId || '',
                              leadStudentDept: found.department || ''
                            }));
                          }
                        }}
                      >
                        <option value="">-- Quick autofill from registered student --</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.studentId || s.department})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Student Leader Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={projectForm.leadStudentName}
                        onChange={(e) => setProjectForm({ ...projectForm, leadStudentName: e.target.value })}
                        placeholder="e.g. Alex Rivera"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Roll Number / Student ID</label>
                      <input
                        type="text"
                        className="form-input"
                        value={projectForm.leadStudentRoll}
                        onChange={(e) => setProjectForm({ ...projectForm, leadStudentRoll: e.target.value })}
                        placeholder="e.g. QU-2024-001"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-input"
                        value={projectForm.leadStudentDept}
                        onChange={(e) => setProjectForm({ ...projectForm, leadStudentDept: e.target.value })}
                        placeholder="e.g. Computer Science & Engineering"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                    <label className="form-label">Leader Role on Project</label>
                    <input
                      type="text"
                      className="form-input"
                      value={projectForm.leadStudentRole}
                      onChange={(e) => setProjectForm({ ...projectForm, leadStudentRole: e.target.value })}
                      placeholder="e.g. Project Lead & Quantum Algorithm Architect"
                    />
                  </div>
                </div>

                {/* 2. TEAMMATES / TEAM MEMBERS */}
                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-light)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={16} style={{ color: 'var(--primary)' }} /> Student Teammates & Collaborators ({projectForm.teammates.length})
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Add all team members contributing to this quantum project
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleAddProjectTeammate}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      <UserPlus size={14} /> + Add Teammate
                    </button>
                  </div>

                  {projectForm.teammates.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                      No additional teammates added yet. Click <strong>"+ Add Teammate"</strong> to add team members.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {projectForm.teammates.map((member, idx) => (
                        <div
                          key={member.id || idx}
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            padding: '0.85rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr)) 34px',
                            gap: '0.5rem',
                            alignItems: 'flex-end'
                          }}
                        >
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Teammate Name</label>
                            <input
                              type="text"
                              className="form-input"
                              value={member.name}
                              onChange={(e) => handleUpdateProjectTeammate(idx, 'name', e.target.value)}
                              placeholder="e.g. John Doe"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Roll / Student ID</label>
                            <input
                              type="text"
                              className="form-input"
                              value={member.studentId}
                              onChange={(e) => handleUpdateProjectTeammate(idx, 'studentId', e.target.value)}
                              placeholder="e.g. QU-2024-002"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Department</label>
                            <input
                              type="text"
                              className="form-input"
                              value={member.department}
                              onChange={(e) => handleUpdateProjectTeammate(idx, 'department', e.target.value)}
                              placeholder="e.g. Computer Science"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Team Role</label>
                            <input
                              type="text"
                              className="form-input"
                              value={member.role}
                              onChange={(e) => handleUpdateProjectTeammate(idx, 'role', e.target.value)}
                              placeholder="e.g. Quantum Circuit Dev"
                              style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                            />
                          </div>

                          <button
                            type="button"
                            className="btn-icon-danger"
                            title="Remove Teammate"
                            onClick={() => handleRemoveProjectTeammate(idx)}
                            style={{ height: '34px', width: '34px', marginBottom: '2px' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. FACULTY LEAD / ADVISOR */}
                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={16} /> Faculty Lead / Research Advisor
                    </h4>
                    {faculty.length > 0 && (
                      <select
                        style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem', borderRadius: '6px' }}
                        onChange={(e) => {
                          const found = faculty.find(f => f.id === e.target.value);
                          if (found) {
                            setProjectForm(prev => ({
                              ...prev,
                              facultyLeadName: found.name,
                              facultyLeadDept: found.department || ''
                            }));
                          }
                        }}
                      >
                        <option value="">-- Quick autofill from registered faculty --</option>
                        {faculty.map(f => (
                          <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Faculty Advisor Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={projectForm.facultyLeadName}
                        onChange={(e) => setProjectForm({ ...projectForm, facultyLeadName: e.target.value })}
                        placeholder="e.g. Dr. Emily Davis"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-input"
                        value={projectForm.facultyLeadDept}
                        onChange={(e) => setProjectForm({ ...projectForm, facultyLeadDept: e.target.value })}
                        placeholder="e.g. Physics & Quantum Science"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Advisory Role</label>
                      <input
                        type="text"
                        className="form-input"
                        value={projectForm.facultyLeadRole}
                        onChange={(e) => setProjectForm({ ...projectForm, facultyLeadRole: e.target.value })}
                        placeholder="e.g. Research Mentor & PI"
                      />
                    </div>
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
                    <label className="form-label">DOI Link / Identifier</label>
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
                    <label className="form-label">Research Area</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paperForm.researchArea}
                      onChange={(e) => setPaperForm({ ...paperForm, researchArea: e.target.value })}
                      placeholder="e.g. Quantum Error Correction"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Citations Count</label>
                    <input
                      type="number"
                      className="form-input"
                      value={paperForm.citations}
                      onChange={(e) => setPaperForm({ ...paperForm, citations: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Authors Section */}
                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-light)'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={16} style={{ color: 'var(--primary)' }} />
                    Authors & Co-Authors
                  </h4>

                  <div className="form-grid-2" style={{ marginBottom: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Faculty Author Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={paperForm.facultyAuthorName}
                        onChange={(e) => setPaperForm({ ...paperForm, facultyAuthorName: e.target.value })}
                        placeholder="e.g. Dr. Emily Davis"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Faculty Department</label>
                      <input
                        type="text"
                        className="form-input"
                        value={paperForm.facultyAuthorDept}
                        onChange={(e) => setPaperForm({ ...paperForm, facultyAuthorDept: e.target.value })}
                        placeholder="e.g. Physics"
                      />
                    </div>
                  </div>

                  <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Student Co-Author Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={paperForm.studentAuthorName}
                        onChange={(e) => setPaperForm({ ...paperForm, studentAuthorName: e.target.value })}
                        placeholder="e.g. Alex Rivera"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Student ID / Roll No</label>
                      <input
                        type="text"
                        className="form-input"
                        value={paperForm.studentAuthorRoll}
                        onChange={(e) => setPaperForm({ ...paperForm, studentAuthorRoll: e.target.value })}
                        placeholder="e.g. QU-2024-001"
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Student Department</label>
                      <input
                        type="text"
                        className="form-input"
                        value={paperForm.studentAuthorDept}
                        onChange={(e) => setPaperForm({ ...paperForm, studentAuthorDept: e.target.value })}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
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

                {/* Team Leader & Teammates Section */}
                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-light)',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={16} /> Team Leader ({audience === 'faculty' ? 'Faculty Lead' : 'Student Lead'})
                  </h4>

                  <div className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Leader Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={hackathonForm.leadName}
                        onChange={(e) => setHackathonForm({ ...hackathonForm, leadName: e.target.value })}
                        placeholder="e.g. Alex Rivera"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">{audience === 'faculty' ? 'Faculty / Employee ID' : 'Student ID / Roll No'}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={hackathonForm.leadId}
                        onChange={(e) => setHackathonForm({ ...hackathonForm, leadId: e.target.value })}
                        placeholder={audience === 'faculty' ? 'e.g. FAC-001' : 'e.g. QU-2024-001'}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-input"
                        value={hackathonForm.leadDept}
                        onChange={(e) => setHackathonForm({ ...hackathonForm, leadDept: e.target.value })}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                  </div>

                  {/* Teammates Section in Hackathon */}
                  <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={15} style={{ color: 'var(--primary)' }} /> Additional Teammates ({hackathonForm.teammates.length})
                      </h5>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={handleAddHackathonTeammate}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <UserPlus size={14} /> + Add Teammate
                      </button>
                    </div>

                    {hackathonForm.teammates.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        No additional teammates added. Click <strong>"+ Add Teammate"</strong> to add extra team members.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {hackathonForm.teammates.map((member, idx) => (
                          <div
                            key={member.id || idx}
                            style={{
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-light)',
                              borderRadius: '8px',
                              padding: '0.75rem',
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr)) 34px',
                              gap: '0.5rem',
                              alignItems: 'flex-end'
                            }}
                          >
                            <div>
                              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Name</label>
                              <input
                                type="text"
                                className="form-input"
                                value={member.name}
                                onChange={(e) => handleUpdateHackathonTeammate(idx, 'name', e.target.value)}
                                placeholder="Teammate Name"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>ID / Roll</label>
                              <input
                                type="text"
                                className="form-input"
                                value={member.studentId}
                                onChange={(e) => handleUpdateHackathonTeammate(idx, 'studentId', e.target.value)}
                                placeholder="ID / Roll"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Department</label>
                              <input
                                type="text"
                                className="form-input"
                                value={member.department}
                                onChange={(e) => handleUpdateHackathonTeammate(idx, 'department', e.target.value)}
                                placeholder="Department"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                              />
                            </div>
                            <button
                              type="button"
                              className="btn-icon-danger"
                              title="Remove Teammate"
                              onClick={() => handleRemoveHackathonTeammate(idx)}
                              style={{ height: '34px', width: '34px', marginBottom: '2px' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
