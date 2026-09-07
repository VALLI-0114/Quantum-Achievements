import React from 'react';
import { X, Download, Award, ShieldCheck, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import { downloadCertificatePDF } from '../../utils/pdfGenerator';

export const CertificateModal = ({ isOpen, onClose, certData }) => {
  if (!isOpen || !certData) return null;

  const {
    recipientName = "Candidate",
    recipientRole = "Student Candidate",
    certificateTitle = "Quantum Developer Certification",
    issuer = "IBM Quantum & Q-HUB",
    credentialId = "QHUB-CERT-001",
    issueDate = "2025-05-10",
    grade = "Distinction",
    uploadedFile = null
  } = certData;

  const handleDownloadPDF = () => {
    downloadCertificatePDF({
      recipientName,
      recipientRole,
      certificateTitle,
      issuer,
      credentialId,
      issueDate,
      grade
    });
  };

  const handleOpenUploadedFile = () => {
    if (!uploadedFile?.dataUrl) return;
    const win = window.open();
    if (win) {
      win.document.write(
        `<iframe src="${uploadedFile.dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award style={{ color: 'var(--primary)', width: 22, height: 22 }} />
            <h3>Official Quantum Certificate of Achievement</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ background: '#FAF5FF', padding: '2rem' }}>
          {/* Certificate Visual Presentation */}
          <div style={{
            background: '#FFFFFF',
            border: '8px double #7C3AED',
            borderRadius: '12px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            position: 'relative'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#F5F3FF',
              color: '#7C3AED',
              padding: '0.3rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1rem'
            }}>
              <ShieldCheck size={16} /> Verified Institutional Credential
            </div>

            <h1 style={{
              fontFamily: 'serif',
              fontSize: '1.85rem',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              letterSpacing: '0.02em'
            }}>
              Quantum Achievement Certificate
            </h1>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              This certifies that
            </p>

            <h2 style={{
              fontSize: '1.75rem',
              color: 'var(--primary)',
              fontWeight: 800,
              margin: '0.25rem 0 0.5rem'
            }}>
              {recipientName}
            </h2>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '1.25rem' }}>
              {recipientRole}
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 0.75rem' }}>
              has successfully achieved and demonstrated verified mastery in:
            </p>

            <div style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#7C3AED',
              background: '#FAF5FF',
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              display: 'inline-block',
              margin: '0.5rem 0 1.25rem',
              border: '1px solid #DDD6FE'
            }}>
              {certificateTitle}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div>Issuer: <strong>{issuer}</strong></div>
              <div>Grade: <strong style={{ color: 'var(--primary)' }}>{grade}</strong></div>
            </div>

            {uploadedFile && (
              <div style={{
                marginTop: '1.25rem',
                padding: '0.65rem 1rem',
                background: '#F0FDFA',
                border: '1px solid #99F6E4',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: 'var(--accent-teal)'
              }}>
                <FileText size={15} /> Attached File: <strong>{uploadedFile.name}</strong> ({uploadedFile.size})
              </div>
            )}

            <div style={{
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}>
              <div style={{ textAlign: 'left', fontFamily: 'monospace' }}>
                <div>ISSUE DATE: {issueDate}</div>
                <div>CREDENTIAL ID: {credentialId}</div>
                <div style={{ color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                  <CheckCircle2 size={12} /> SHA256 Cryptographically Audited
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Q-HUB Academic Council</div>
                <div style={{ fontStyle: 'italic' }}>Institutional Center of Quantum Excellence</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {uploadedFile && (
            <button className="btn btn-outline" onClick={handleOpenUploadedFile} style={{ color: 'var(--accent-teal)', borderColor: '#99F6E4', background: '#F0FDFA' }}>
              <ExternalLink size={15} /> View Attached File ({uploadedFile.name.slice(0, 18)}...)
            </button>
          )}
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            <Download size={16} /> Download Certificate PDF
          </button>
        </div>
      </div>
    </div>
  );
};
