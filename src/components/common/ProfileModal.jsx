import React from 'react';
import { X, Download, User, BookOpen, Award, Layers, FileText, Trophy, CheckCircle2 } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCandidatePortfolioPDF } from '../../utils/pdfGenerator';

export const ProfileModal = ({ isOpen, onClose, personId, roleType = 'student', onOpenCertificate }) => {
  const { faculty, students, courses, certificates, projects, researchPapers, hackathons } = useQuantumDB();

  if (!isOpen || !personId) return null;

  const isFaculty = roleType === 'faculty';
  const person = isFaculty
    ? faculty.find(f => f.id === personId)
    : students.find(s => s.id === personId);

  if (!person) return null;

  // Filter completed courses
  const personCourses = courses.filter(c => {
    if (isFaculty) {
      return (c.facultyCompletions || []).some(fc => fc.facultyId === person.id);
    } else {
      return (c.studentCompletions || []).some(sc => sc.studentId === person.id);
    }
  }).map(c => {
    const record = isFaculty
      ? c.facultyCompletions.find(fc => fc.facultyId === person.id)
      : c.studentCompletions.find(sc => sc.studentId === person.id);
    return {
      ...c,
      completionDate: record?.completionDate || '2025-01-01',
      grade: record?.grade || 'Distinction',
      certificateId: record?.certificateId || 'QHUB-CERT-01'
    };
  });

  // Filter certificates
  const personCertificates = certificates.filter(cert => {
    if (isFaculty) {
      return (cert.facultyRecipients || []).some(fr => fr.facultyId === person.id);
    } else {
      return (cert.studentRecipients || []).some(sr => sr.studentId === person.id);
    }
  }).map(cert => {
    const record = isFaculty
      ? cert.facultyRecipients.find(fr => fr.facultyId === person.id)
      : cert.studentRecipients.find(sr => sr.studentId === person.id);
    return {
      ...cert,
      issueDate: record?.issueDate || '2025-01-01',
      credentialId: record?.credentialId || 'QHUB-CRED-01',
      score: record?.score || 'Distinction'
    };
  });

  // Filter projects
  const personProjects = projects.filter(p => {
    if (isFaculty) {
      return (p.facultyInvolved || []).some(fi => fi.facultyId === person.id);
    } else {
      return (p.studentsInvolved || []).some(si => si.studentId === person.id);
    }
  }).map(p => {
    const role = isFaculty
      ? p.facultyInvolved.find(fi => fi.facultyId === person.id)?.role
      : p.studentsInvolved.find(si => si.studentId === person.id)?.role;
    return { ...p, role: role || 'Contributor' };
  });

  // Filter papers
  const personPapers = researchPapers.filter(paper => {
    if (isFaculty) {
      return (paper.facultyAuthors || []).includes(person.id);
    } else {
      return (paper.studentAuthors || []).includes(person.id);
    }
  });

  // Filter hackathons
  const personHackathons = hackathons.filter(h => {
    if (isFaculty) {
      return (h.facultyParticipants || []).some(fp => fp.facultyId === person.id);
    } else {
      return (h.studentParticipants || []).some(sp => sp.studentId === person.id);
    }
  }).map(h => {
    const record = isFaculty
      ? h.facultyParticipants.find(fp => fp.facultyId === person.id)
      : h.studentParticipants.find(sp => sp.studentId === person.id);
    return {
      ...h,
      teamName: record?.teamName || 'Team Quantum',
      projectBuilt: record?.projectBuilt || 'Quantum Algorithm',
      award: record?.award || 'Award Recipient'
    };
  });

  const handleDownloadPDF = () => {
    downloadCandidatePortfolioPDF({
      name: person.name,
      roleType: isFaculty ? 'Faculty Member' : 'Student Candidate',
      department: person.department,
      id: person.studentId || person.id,
      email: person.email,
      highestHonor: person.highestHonor || 'Quantum Scholar',
      courses: personCourses,
      certificates: personCertificates,
      projects: personProjects,
      papers: personPapers,
      hackathons: personHackathons
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User style={{ color: isFaculty ? 'var(--secondary)' : 'var(--primary)', width: 22, height: 22 }} />
            <h3>{person.name} • {isFaculty ? 'Faculty Research Dossier' : 'Student Achievement Portfolio'}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Header Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: isFaculty
                  ? 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)'
                  : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: '#FFFFFF',
                fontSize: '1.4rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {person.avatar || person.name.slice(0, 2).toUpperCase()}
              </div>

              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {person.name}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {isFaculty ? person.title : `${person.year || '4th Year'} • ID: ${person.studentId}`} • {person.department}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {person.email}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="metric-pill success" style={{ marginBottom: '0.35rem' }}>
                <CheckCircle2 size={13} /> Verified Active Roster
              </span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Highest Credential
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: isFaculty ? 'var(--secondary)' : 'var(--primary)' }}>
                {person.highestHonor || 'Quantum Certified'}
              </div>
            </div>
          </div>

          {/* 5 Metric Summary Counters */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{personCourses.length}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Courses Completed</div>
            </div>
            <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>{personCertificates.length}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Certificates</div>
            </div>
            <div style={{ background: '#F0FDFA', border: '1px solid #99F6E4', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-teal)' }}>{personProjects.length}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Projects</div>
            </div>
            <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{personPapers.length}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Research Papers</div>
            </div>
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706' }}>{personHackathons.length}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hackathons</div>
            </div>
          </div>

          {/* Detailed Lists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Courses */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <BookOpen size={18} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  1. Completed Courses ({personCourses.length})
                </h4>
              </div>
              {personCourses.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No completed courses recorded yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {personCourses.map(c => (
                    <div key={c.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-surface-subtle)',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)'
                    }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.code}: {c.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Provider: {c.provider} • Completed: {c.completionDate} • Grade: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{c.grade}</span>
                        </div>
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenCertificate({
                          recipientName: person.name,
                          recipientRole: isFaculty ? 'Faculty Member' : 'Student Candidate',
                          certificateTitle: `${c.code}: ${c.name}`,
                          issuer: c.provider,
                          credentialId: c.certificateId,
                          issueDate: c.completionDate,
                          grade: c.grade
                        })}
                      >
                        <Award size={14} /> View Certificate
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certificates */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <Award size={18} style={{ color: 'var(--secondary)' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  2. Accredited Certifications ({personCertificates.length})
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {personCertificates.map(cert => (
                  <div key={cert.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-surface-subtle)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)'
                  }}>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{cert.title}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Issuer: {cert.issuer} • Issue Date: {cert.issueDate} • ID: <span style={{ fontFamily: 'monospace' }}>{cert.credentialId}</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onOpenCertificate({
                        recipientName: person.name,
                        recipientRole: isFaculty ? 'Faculty Member' : 'Student Candidate',
                        certificateTitle: cert.title,
                        issuer: cert.issuer,
                        credentialId: cert.credentialId,
                        issueDate: cert.issueDate,
                        grade: cert.score
                      })}
                    >
                      <Award size={14} /> View Certificate
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hackathons */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <Trophy size={18} style={{ color: '#D97706' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  3. Hackathons & Competitions ({personHackathons.length})
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {personHackathons.map(h => (
                  <div key={h.id} style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-surface-subtle)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{h.name}</strong>
                      <span className="metric-pill amber">{h.award}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Team: <strong>{h.teamName}</strong> • Project: <em>{h.projectBuilt}</em>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close Dossier
          </button>
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            <Download size={16} /> Download Portfolio PDF
          </button>
        </div>
      </div>
    </div>
  );
};
