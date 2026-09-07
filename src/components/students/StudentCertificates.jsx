import React, { useState } from 'react';
import { Award, ShieldCheck, ArrowLeft, Download, Search, User, CheckCircle2, FileDown, Plus, UserPlus, Trash2 } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCategoryReportPDF, downloadSingleCertificateReportPDF } from '../../utils/pdfGenerator';
import { AddParticipantModal } from '../common/AddParticipantModal';

export const StudentCertificates = ({ onOpenCertificate, onOpenProfile, onAddCertificate }) => {
  const { certificates, students, deleteRecord, removeCertificateRecipient } = useQuantumDB();
  const [selectedCertId, setSelectedCertId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [isAddRecipientModalOpen, setIsAddRecipientModalOpen] = useState(false);

  const selectedCert = certificates.find(c => c.id === selectedCertId);

  const filteredCerts = certificates.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return c.title.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q);
  });

  const handleDownloadAllStudentCertsPDF = () => {
    const reportItems = certificates.map(cert => ({
      title: cert.title,
      subtitle: `Issuer: ${cert.issuer} • Student Recipients: ${(cert.studentRecipients || []).length} Students`
    }));
    downloadCategoryReportPDF({
      categoryTitle: "Student Quantum Certifications Report",
      roleType: "Student",
      items: reportItems
    });
  };

  if (selectedCert) {
    const recipients = (selectedCert.studentRecipients || []).map(r => {
      const s = students.find(stu => stu.id === r.studentId) || {
        name: "Student Recipient",
        department: "Computer Science",
        studentId: "QU-2025"
      };
      return { ...r, student: s, name: s.name, department: s.department };
    }).filter(item => {
      const q = studentSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        item.student.name.toLowerCase().includes(q) ||
        item.student.studentId.toLowerCase().includes(q) ||
        item.student.department.toLowerCase().includes(q)
      );
    });

    const handleDownloadCertRoster = () => {
      downloadSingleCertificateReportPDF({
        certificateTitle: selectedCert.title,
        issuer: selectedCert.issuer,
        code: selectedCert.code || 'CREDENTIAL',
        roleType: "Student",
        recipients: recipients.map(r => ({
          name: r.student.name,
          department: r.student.department,
          issueDate: r.issueDate,
          credentialId: r.credentialId
        }))
      });
    };

    return (
      <div className="drilldown-container">
        <div className="breadcrumb-trail">
          <span className="breadcrumb-link" onClick={() => setSelectedCertId(null)}>
            <ArrowLeft size={16} /> Back to Student Certificates
          </span>
          <span>/</span>
          <span>{selectedCert.code || 'CREDENTIAL'}</span>
        </div>

        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className="metric-pill primary">{selectedCert.code || 'CREDENTIAL'}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Issuer: {selectedCert.issuer}</span>
              </div>

              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0 0.5rem' }}>
                {selectedCert.title}
              </h1>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-outline" onClick={handleDownloadCertRoster}>
                <Download size={16} /> Download Recipients PDF
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete certificate "${selectedCert.title}"?`)) {
                    deleteRecord('certificates', selectedCert.id);
                    setSelectedCertId(null);
                  }
                }}
              >
                <Trash2 size={15} /> Delete Certificate
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-light)'
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: '#EFF6FF',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem'
            }}>
              {(selectedCert.studentRecipients || []).length}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                Total Certified: {(selectedCert.studentRecipients || []).length} Students
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cryptographically verified industry credentials</div>
            </div>
          </div>
        </div>

        <div className="view-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Students Who Earned This Certificate ({recipients.length})
            </h3>
            <span className="metric-pill success">
              <CheckCircle2 size={13} /> Verified
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="view-search-box">
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search student name, roll number, or department..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setIsAddRecipientModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              <UserPlus size={15} /> Add Student Recipient
            </button>
          </div>
        </div>

        <div className="dbms-table-container">
          <table className="dbms-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll / Student ID</th>
                <th>Department</th>
                <th>Issue Date</th>
                <th>Credential ID</th>
                <th>Score / Grade</th>
                <th style={{ textAlign: 'center' }}>Certificate</th>
                <th style={{ textAlign: 'center' }}>Profile</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recipients.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No student recipients found matching query.
                  </td>
                </tr>
              ) : (
                recipients.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                          color: '#FFFFFF',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {item.student.avatar || item.student.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{item.student.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)', fontSize: '0.85rem' }}>
                        {item.student.studentId}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.student.department}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {item.issueDate}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 600 }}>
                        {item.credentialId}
                      </span>
                    </td>
                    <td>
                      <span className="metric-pill success">{item.score || 'Distinction'}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenCertificate({
                          recipientName: item.student.name,
                          recipientRole: "Student Candidate",
                          certificateTitle: selectedCert.title,
                          issuer: selectedCert.issuer,
                          credentialId: item.credentialId,
                          issueDate: item.issueDate,
                          grade: item.score || "Distinction",
                          uploadedFile: item.uploadedFile
                        })}
                      >
                        <Award size={14} /> View Certificate
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenProfile(item.student.id, 'student')}
                      >
                        <User size={14} /> View Profile
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-icon-danger"
                        title="Remove student recipient"
                        onClick={() => {
                          if (window.confirm(`Remove ${item.student.name} from this certificate?`)) {
                            removeCertificateRecipient(selectedCert.id, 'students', item.student.id);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Student Recipient Modal */}
        <AddParticipantModal
          isOpen={isAddRecipientModalOpen}
          onClose={() => setIsAddRecipientModalOpen(false)}
          targetType="certificate"
          audienceType="student"
          entityId={selectedCert.id}
          entityTitle={selectedCert.title}
          entityCode={selectedCert.code}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="view-toolbar">
        <div className="view-search-box">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search quantum certifications by title or issuing body..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={handleDownloadAllStudentCertsPDF}>
            <FileDown size={15} /> Download Certs PDF
          </button>
          <button className="btn btn-primary" onClick={onAddCertificate}>
            ➕ Add Certificate
          </button>
        </div>
      </div>

      <div className="cards-grid-3">
        {filteredCerts.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3.5rem 1rem',
            background: 'var(--bg-surface)',
            borderRadius: '16px',
            border: '1px solid var(--border-light)'
          }}>
            <Award size={44} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 700 }}>No Student Certifications Found</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Start by adding a quantum certification credential for students.</p>
            <button className="btn btn-primary" onClick={onAddCertificate}>➕ Add Certificate</button>
          </div>
        ) : (
          filteredCerts.map(cert => {
            const count = (cert.studentRecipients || []).length;
            return (
              <div
                key={cert.id}
                className="item-card"
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => setSelectedCertId(cert.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="metric-pill primary">{cert.code || 'VERIFIED'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cert.issuer}</span>
                    <button
                      className="btn-icon-danger"
                      title="Delete Certificate"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete certificate "${cert.title}"?`)) {
                          deleteRecord('certificates', cert.id);
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.35 }}>
                  {cert.title}
                </h3>

                <div style={{
                  background: 'var(--bg-surface-subtle)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1rem',
                  marginTop: 'auto',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Students Certified:</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                      {count} Students Earned
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                    View Certified Students →
                  </span>
                  <span className="btn btn-outline btn-sm">
                    {count} Recipients
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
