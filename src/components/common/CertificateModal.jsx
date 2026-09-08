import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  Award,
  ShieldCheck,
  FileText,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Printer,
  FileQuestion,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Sparkles,
  Scroll,
  Layers
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';
import { downloadOfficialCertificatePDF } from '../../utils/pdfGenerator';

export const CertificateModal = ({ isOpen, onClose, certData, onAttachDocument }) => {
  if (!isOpen || !certData) return null;

  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const fileInputRef = useRef(null);

  const {
    recipientName = "Candidate",
    recipientRole = "Faculty Member",
    certificateTitle = "Quantum Certification",
    issuer = "Accredited Institution",
    credentialId = "QHUB-CERT",
    issueDate = new Date().toISOString().slice(0, 10),
    grade = "Distinction",
    uploadedFile = null
  } = certData;

  // Local state for uploaded file to allow instant update when user uploads within modal
  const [currentFile, setCurrentFile] = useState(uploadedFile || certData.fileData || certData.document || null);
  
  // View mode: 'official' (Official generated accredited credential) | 'scan' (Uploaded physical image or PDF scan)
  const [viewMode, setViewMode] = useState(() => (uploadedFile || certData.fileData || certData.document) ? 'scan' : 'official');

  useEffect(() => {
    const file = uploadedFile || certData.fileData || certData.document || null;
    setCurrentFile(file);
    setViewMode(file ? 'scan' : 'official');
    setZoomLevel(1);
    setRotation(0);
    setUploadSuccess(false);
    setImageLoadError(false);
  }, [certData, uploadedFile]);

  const fileObj = currentFile;
  const fileUrl = typeof fileObj === 'string' ? fileObj : (fileObj?.dataUrl || fileObj?.url || null);
  const fileName = (typeof fileObj === 'object' && fileObj?.name) ? fileObj.name : 'Certificate_Document';
  const fileSize = (typeof fileObj === 'object' && fileObj?.size) ? fileObj.size : '';
  const fileType = (typeof fileObj === 'object' && fileObj?.type) ? fileObj.type : '';

  const isPdf = fileType.includes('pdf') || (typeof fileUrl === 'string' && fileUrl.startsWith('data:application/pdf')) || fileName.toLowerCase().endsWith('.pdf');
  const hasUploadedFile = Boolean(fileUrl) && !imageLoadError;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Download Official Institutional PDF Certificate
  const handleDownloadOfficialPDF = () => {
    downloadOfficialCertificatePDF({
      recipientName,
      recipientRole,
      certificateTitle,
      issuer,
      credentialId,
      issueDate,
      grade
    });
  };

  // Download Uploaded Raw Scan File
  const handleDownloadScanFile = () => {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || `${recipientName.replace(/\s+/g, '_')}_Scan.${isPdf ? 'pdf' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (viewMode === 'scan' && fileUrl) {
      const win = window.open();
      if (win) {
        if (isPdf) {
          win.document.write(
            `<iframe src="${fileUrl}" frameborder="0" style="border:0; width:100%; height:100%;" onload="window.print()"></iframe>`
          );
        } else {
          win.document.write(`
            <html>
              <head><title>Print Certificate - ${recipientName}</title></head>
              <body style="margin:0; background:#fff; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                <img src="${fileUrl}" style="max-width:96%; max-height:96vh; object-fit:contain;" onload="window.print();" />
              </body>
            </html>
          `);
        }
      }
    } else {
      handleDownloadOfficialPDF();
    }
  };

  // Direct file attachment handler
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressed = await compressImageFile(file, 1200, 0.82);
      if (compressed) {
        setCurrentFile(compressed);
        setViewMode('scan');
        setImageLoadError(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);

        if (onAttachDocument) {
          const targetKey = credentialId || certData.id || certData.code || certificateTitle;
          await onAttachDocument(targetKey, compressed);
        }
      }
    } catch (err) {
      console.error("Certificate document attachment failed:", err);
      alert("Could not process file. Please upload a standard image or PDF.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`modal-overlay ${isFullscreen ? 'fullscreen-overlay' : ''}`} onClick={onClose} style={{ zIndex: 1100 }}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <div
        className={`modal-content ${isFullscreen ? 'modal-fullscreen' : 'modal-xl'}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: isFullscreen ? '98vw' : '960px',
          width: '95vw',
          maxHeight: isFullscreen ? '98vh' : '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          borderRadius: isFullscreen ? '8px' : '16px',
          border: '1px solid var(--border-light)',
          background: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-light)', padding: '0.85rem 1.5rem', background: '#FAFAFC', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: '#F5F3FF',
              color: 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Award size={20} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {recipientName}
                </h3>
                <span className="metric-pill secondary" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                  {recipientRole}
                </span>
                <span className="metric-pill success" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={12} /> Verified Credential
                </span>
                {uploadSuccess && (
                  <span className="metric-pill success" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#DCFCE7', color: '#166534' }}>
                    <CheckCircle2 size={12} /> Saved to Database!
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {certificateTitle} • <strong style={{ color: 'var(--text-primary)' }}>{issuer}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              className="btn-icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
              style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button className="modal-close-btn" onClick={onClose} style={{ marginLeft: '0.25rem' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Certificate Metadata & View Switcher Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.65rem 1.5rem',
          background: '#F8FAFC',
          borderBottom: '1px solid var(--border-light)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          flexShrink: 0
        }}>
          {/* Metadata chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Credential ID: </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{credentialId}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Issue Date: </span>
              <span style={{ fontWeight: 600 }}>{issueDate}</span>
            </div>
            {grade && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Grade: </span>
                <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{grade}</span>
              </div>
            )}
          </div>

          {/* View Mode Toggle & Upload Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: '#E2E8F0', padding: '2px', borderRadius: '6px' }}>
              <button
                type="button"
                onClick={() => setViewMode('official')}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'official' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'official' ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: viewMode === 'official' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Scroll size={13} /> Official Credential
              </button>

              <button
                type="button"
                onClick={() => setViewMode('scan')}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  background: viewMode === 'scan' ? '#FFFFFF' : 'transparent',
                  color: viewMode === 'scan' ? 'var(--secondary)' : 'var(--text-secondary)',
                  boxShadow: viewMode === 'scan' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Layers size={13} /> Attached Scan {currentFile ? `(${fileName.slice(0, 14)}...)` : ''}
              </button>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {isUploading ? (
                <><Loader2 size={13} className="spin-animate" /> Saving to DB...</>
              ) : (
                <><UploadCloud size={13} /> {currentFile ? 'Replace Scan' : 'Attach Scan'}</>
              )}
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="modal-body" style={{
          padding: '1.5rem 1.25rem',
          background: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: 1,
          minHeight: 0,
          position: 'relative'
        }}>
          {viewMode === 'official' ? (
            /* OFFICIAL INSTITUTIONAL ACCREDITED CERTIFICATE DOCUMENT */
            <div
              style={{
                width: '100%',
                maxWidth: '820px',
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '4px solid #1E293B',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                padding: '2rem 2.25rem',
                position: 'relative',
                boxSizing: 'border-box',
                color: '#0F172A',
                textAlign: 'center',
                margin: 'auto'
              }}
            >
              {/* Inner Gold Inset Border */}
              <div style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                right: '8px',
                bottom: '8px',
                border: '1.5px solid #D97706',
                borderRadius: '8px',
                pointerEvents: 'none'
              }}></div>

              {/* Corner Dots */}
              <div style={{ position: 'absolute', top: 6, left: 6, width: 8, height: 8, background: '#4F46E5', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#4F46E5', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', bottom: 6, left: 6, width: 8, height: 8, background: '#4F46E5', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', bottom: 6, right: 6, width: 8, height: 8, background: '#4F46E5', borderRadius: '50%' }}></div>

              {/* Header Badge */}
              <div style={{
                display: 'inline-block',
                background: '#F5F3FF',
                border: '1px solid #DDD6FE',
                borderRadius: '20px',
                padding: '0.25rem 1rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#4F46E5',
                letterSpacing: '0.08em',
                marginBottom: '0.6rem'
              }}>
                INSTITUTIONAL QUANTUM COMPUTING NETWORK & Q-HUB
              </div>

              <h2 style={{
                fontFamily: 'Georgia, serif',
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0.15rem 0',
                letterSpacing: '0.04em'
              }}>
                CERTIFICATE OF ACHIEVEMENT
              </h2>

              <div style={{ fontSize: '0.8rem', color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                This official credential is proudly conferred upon
              </div>

              {/* Candidate Name */}
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#4338CA',
                margin: '0.75rem 0 0.2rem',
                fontFamily: 'Georgia, serif',
                borderBottom: '2px solid #E0E7FF',
                display: 'inline-block',
                padding: '0 2rem 0.25rem'
              }}>
                {recipientName}
              </div>

              <div style={{ fontSize: '0.84rem', color: '#475569', maxWidth: '640px', margin: '0.5rem auto', lineHeight: 1.45 }}>
                as a recognized <strong>{recipientRole}</strong>, in formal recognition of successfully completing the curriculum, examination, and laboratory benchmarks for:
              </div>

              {/* Certificate / Course Title Card */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '0.7rem 1.25rem',
                margin: '0.75rem auto',
                maxWidth: '680px'
              }}>
                <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0F172A' }}>
                  {certificateTitle}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.15rem' }}>
                  Accredited & Issued by: <strong style={{ color: '#334155' }}>{issuer}</strong>
                </div>
              </div>

              {/* Honors Badge */}
              {grade && (
                <div style={{
                  display: 'inline-block',
                  background: '#DCFCE7',
                  border: '1px solid #86EFAC',
                  borderRadius: '20px',
                  padding: '0.25rem 0.95rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#166534',
                  marginBottom: '0.75rem'
                }}>
                  Honors & Distinction: {grade}
                </div>
              )}

              {/* Verification Metadata Strip */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                background: '#F1F5F9',
                borderRadius: '6px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.75rem',
                color: '#475569',
                maxWidth: '680px',
                margin: '0 auto 1rem'
              }}>
                <div><strong>Credential ID:</strong> <span style={{ fontFamily: 'monospace', color: '#4338CA' }}>{credentialId}</span></div>
                <div><strong>Issue Date:</strong> {issueDate}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#166534', fontWeight: 600 }}>
                  <ShieldCheck size={13} /> Cryptographically Verified
                </div>
              </div>

              {/* Dual Signatures & Gold Seal */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                maxWidth: '680px',
                margin: '0 auto',
                paddingTop: '0.35rem'
              }}>
                {/* Dean Signature */}
                <div style={{ textAlign: 'center', width: '170px' }}>
                  <div style={{ borderBottom: '1px solid #94A3B8', paddingBottom: '0.2rem', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.9rem', color: '#0F172A' }}>
                    Dr. A. Ramachandran
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.15rem', fontWeight: 600 }}>
                    Dean of Quantum Science
                  </div>
                </div>

                {/* Verified Gold Seal */}
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FDE68A 0%, #D97706 100%)',
                  border: '2px solid #B45309',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#78350F',
                  fontWeight: 900,
                  fontSize: '0.52rem',
                  lineHeight: 1.1,
                  textAlign: 'center'
                }}>
                  <span>Q-HUB</span>
                  <span>SEAL</span>
                  <span>VERIFIED</span>
                </div>

                {/* Academic Director Signature */}
                <div style={{ textAlign: 'center', width: '170px' }}>
                  <div style={{ borderBottom: '1px solid #94A3B8', paddingBottom: '0.2rem', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.9rem', color: '#0F172A' }}>
                    Prof. Elena Rostova
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.15rem', fontWeight: 600 }}>
                    Quantum Academic Council
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ATTACHED SCAN / PHYSICAL DOCUMENT VIEWER */
            hasUploadedFile ? (
              isPdf ? (
                /* PDF Viewer */
                <div style={{ width: '100%', height: '100%', minHeight: '520px', borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF' }}>
                  <iframe
                    src={fileUrl}
                    title={`Certificate Scan - ${certificateTitle}`}
                    style={{ width: '100%', height: '100%', minHeight: '520px', border: 'none' }}
                  />
                </div>
              ) : (
                /* Image Scan Viewer with Solid White Card Backing */
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'auto',
                  padding: '1rem'
                }}>
                  <div style={{
                    background: '#FFFFFF',
                    padding: '8px',
                    borderRadius: '10px',
                    boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
                    maxWidth: '100%',
                    maxHeight: isFullscreen ? '78vh' : '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src={fileUrl}
                      alt={`Certificate Scan for ${recipientName}`}
                      onError={() => setImageLoadError(true)}
                      style={{
                        maxWidth: '100%',
                        maxHeight: isFullscreen ? '74vh' : '56vh',
                        objectFit: 'contain',
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.2s ease',
                        borderRadius: '6px'
                      }}
                    />
                  </div>
                </div>
              )
            ) : (
              /* No Scan Attached or Image Error */
              <div style={{
                textAlign: 'center',
                padding: '2.5rem 2rem',
                color: '#94A3B8',
                maxWidth: '520px',
                background: '#1E293B',
                borderRadius: '14px',
                border: '1px solid #334155',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#334155',
                  color: '#CBD5E1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <FileQuestion size={28} />
                </div>
                <h4 style={{ color: '#F8FAFC', fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  No Physical Document Scan Attached
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  This record is registered with verified credential metadata (<strong style={{ color: '#E2E8F0' }}>{credentialId}</strong>). You can view the Official Accredited Credential, or upload your physical scan below.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setViewMode('official')}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Scroll size={16} /> View Official Credential
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="btn btn-outline"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#F8FAFC', borderColor: '#475569' }}
                  >
                    {isUploading ? <Loader2 size={16} className="spin-animate" /> : <UploadCloud size={16} />}
                    Upload Scan (Image / PDF)
                  </button>
                </div>
              </div>
            )
          )}

          {/* Floating Controls for Image Scans */}
          {viewMode === 'scan' && hasUploadedFile && !isPdf && (
            <div style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              zIndex: 10
            }}>
              <button
                onClick={handleZoomIn}
                style={{ background: 'transparent', border: 'none', color: '#F8FAFC', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <span style={{ color: '#94A3B8', fontSize: '0.75rem', minWidth: '42px', textAlign: 'center', fontFamily: 'monospace' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomOut}
                style={{ background: 'transparent', border: 'none', color: '#F8FAFC', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)', margin: '0 0.2rem' }}></div>
              <button
                onClick={handleRotate}
                style={{ background: 'transparent', border: 'none', color: '#F8FAFC', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' }}
                title="Rotate 90°"
              >
                <RotateCw size={16} />
              </button>
              {(zoomLevel !== 1 || rotation !== 0) && (
                <button
                  onClick={handleResetZoom}
                  style={{ background: '#334155', border: 'none', color: '#F8FAFC', cursor: 'pointer', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', padding: '0.85rem 1.5rem', background: '#FAFAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-outline"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Printer size={15} /> Print
            </button>

            {hasUploadedFile && viewMode === 'scan' && (
              <button
                className="btn btn-outline"
                onClick={handleDownloadScanFile}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-teal)', borderColor: '#99F6E4', background: '#F0FDFA' }}
              >
                <Download size={15} /> Download Attached Scan
              </button>
            )}

            <button
              className="btn btn-primary"
              onClick={handleDownloadOfficialPDF}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Download size={15} /> Download Official PDF Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


