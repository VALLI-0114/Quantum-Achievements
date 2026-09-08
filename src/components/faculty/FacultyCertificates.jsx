import React, { useState } from 'react';
import { Award, ShieldCheck, ArrowLeft, Download, Search, User, CheckCircle2, FileDown, Plus, UserPlus, Trash2 } from 'lucide-react';
import { useQuantumDB } from '../../data/db';
import { downloadCategoryReportPDF, downloadSingleCertificateReportPDF } from '../../utils/pdfGenerator';
import { AddParticipantModal } from '../common/AddParticipantModal';

export const FacultyCertificates = ({ onOpenCertificate, onOpenProfile, onAddCertificate }) => {
  const { certificates, faculty, deleteRecord, confirmDelete, removeCertificateRecipient } = useQuantumDB();
  const [selectedCertId, setSelectedCertId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [isAddRecipientModalOpen, setIsAddRecipientModalOpen] = useState(false);

  const selectedCert = certificates.find(c => c.id === selectedCertId);

  const filteredCerts = certificates.filter(c => {
    const isFacultyCert = c.targetAudience === 'faculty' ||
      (c.facultyRecipients && c.facultyRecipients.length > 0) ||
      (!c.targetAudience && (!c.studentRecipients || c.studentRecipients.length === 0));

    if (!isFacultyCert) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return c.title.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q);
  });

  const handleDownloadAllCertsPDF = () => {
    const reportItems = certificates.map(cert => ({
      title: cert.title,
      subtitle: `Issuer: ${cert.issuer} • Faculty Recipients: ${(cert.facultyRecipients || []).length} Members`
    }));
    downloadCategoryReportPDF({
      categoryTitle: "Faculty Quantum Certifications Report",
      roleType: "Faculty",
      items: reportItems
    });
  };

  if (selectedCert) {
    const recipients = (selectedCert.facultyRecipients || []).map(r => {
      const f = faculty.find(fac => fac.id === r.facultyId) || {
        name: "Dr. Faculty Member",
        department: "Computer Science",
        title: "Associate Professor"
      };
      return { ...r, faculty: f, name: f.name, department: f.department };
    }).filter(item => {
      const q = facultySearch.toLowerCase().trim();
      if (!q) return true;
      return item.faculty.name.toLowerCase().includes(q) || item.faculty.department.toLowerCase().includes(q);
    });

    const handleDownloadCertRoster = () => {
      downloadSingleCertificateReportPDF({
        certificateTitle: selectedCert.title,
        issuer: selectedCert.issuer,
        code: selectedCert.code || 'CREDENTIAL',
        roleType: "Faculty",
        recipients: recipients.map(r => ({
          name: r.faculty.name,
          department: r.faculty.department,
          issueDate: r.issueDate,
          credentialId: r.credentialId
        }))
      });
    };

    return (
      <div className="drilldown-container">
        <div className="breadcrumb-trail">
          <span className="breadcrumb-link" onClick={() => setSelectedCertId(null)}>
            <ArrowLeft size={16} /> Back to Faculty Certificates
          </span>
          <span>/</span>
          <span>{selectedCert.code || 'CERTIFICATE'}</span>
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
                <span className="metric-pill secondary">{selectedCert.code || 'CREDENTIAL'}</span>
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
                  confirmDelete({
                    title: selectedCert.title,
                    message: `Are you sure you want to delete certificate "${selectedCert.title}"?`,
                    onConfirm: () => {
                      deleteRecord('certificates', selectedCert.id);
                      setSelectedCertId(null);
                    }
                  });
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
              background: '#F5F3FF',
              color: 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem'
            }}>
              {(selectedCert.facultyRecipients || []).length}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary)' }}>
                Total Certified: {(selectedCert.facultyRecipients || []).length} Faculty Members
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Cryptographically verified industry credentials</div>
            </div>
          </div>
        </div>

        <div className="view-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Faculty Members Who Earned This Certificate ({recipients.length})
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
                placeholder="Search faculty recipients..."
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
              />
            </div>

            <button
              className="btn btn-secondary"
              onClick={() => setIsAddRecipientModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
            >
              <UserPlus size={15} /> Add Faculty Recipient
            </button>
          </div>
        </div>

        <div className="dbms-table-container">
          <table className="dbms-table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Department</th>
                <th>Issue Date</th>
                <th>Credential ID</th>
                <th>Distinction</th>
                <th style={{ textAlign: 'center' }}>Certificate</th>
                <th style={{ textAlign: 'center' }}>Profile</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recipients.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No faculty recipients recorded for this credential matching search.
                  </td>
                </tr>
              ) : (
                recipients.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
                          color: '#FFFFFF',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {item.faculty.avatar || item.faculty.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>{item.faculty.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.faculty.title}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.faculty.department}</span>
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
                          recipientName: item.faculty.name,
                          recipientRole: "Faculty Member",
                          certificateTitle: selectedCert.title,
                          issuer: selectedCert.issuer,
                          credentialId: item.credentialId,
                          issueDate: item.issueDate,
                          grade: item.score || "Distinction",
                          uploadedFile: item.uploadedFile || selectedCert.uploadedFile
                        })}
                      >
                        <Award size={14} /> View Certificate
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => onOpenProfile(item.faculty.id, 'faculty')}
                      >
                        <User size={14} /> View Profile
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn-icon-danger"
                        title="Remove faculty recipient"
                        onClick={() => {
                          confirmDelete({
                            title: `Remove ${item.faculty.name}`,
                            message: `Remove ${item.faculty.name} from this certificate?`,
                            onConfirm: () => removeCertificateRecipient(selectedCert.id, 'faculty', item.faculty.id)
                          });
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

        {/* Add Faculty Recipient Modal */}
        <AddParticipantModal
          isOpen={isAddRecipientModalOpen}
          onClose={() => setIsAddRecipientModalOpen(false)}
          targetType="certificate"
          audienceType="faculty"
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
          <button className="btn btn-outline" onClick={handleDownloadAllCertsPDF}>
            <FileDown size={15} /> Download Certs PDF
          </button>
          <button className="btn btn-secondary" onClick={onAddCertificate}>
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
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.35rem', fontWeight: 700 }}>No Faculty Certifications Found</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Start by adding a quantum certification credential for faculty.</p>
            <button className="btn btn-secondary" onClick={onAddCertificate}>➕ Add Certificate</button>
          </div>
        ) : (
          filteredCerts.map(cert => {
            const count = (cert.facultyRecipients || []).length;
            return (
              <div
                key={cert.id}
                className="item-card"
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => setSelectedCertId(cert.id)}
              >
                <div className="card-header-row">
                  <span className="metric-pill secondary card-badge-pill" title={cert.code || 'VERIFIED'}>
                    {cert.code || 'VERIFIED'}
                  </span>
                  <div className="card-header-meta">
                    <span className="card-header-meta-text" title={cert.issuer}>
                      {cert.issuer}
                    </span>
                    <button
                      className="btn-icon-danger"
                      title="Delete Certificate"
                      style={{ flexShrink: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        confirmDelete({
                          title: cert.title,
                          message: `Are you sure you want to delete certificate "${cert.title}"?`,
                          onConfirm: () => deleteRecord('certificates', cert.id)
                        });
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h3 className="card-title-clamp" title={cert.title}>
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
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Faculty Certified:</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--secondary)' }}>
                      {count} Faculty Members
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 600 }}>
                    View Certified Faculty →
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
