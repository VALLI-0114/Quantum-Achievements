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
  RefreshCw
} from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';

export const CertificateModal = ({ isOpen, onClose, certData, onAttachDocument }) => {
  if (!isOpen || !certData) return null;

  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  useEffect(() => {
    setCurrentFile(uploadedFile || certData.fileData || certData.document || null);
    setZoomLevel(1);
    setRotation(0);
    setUploadSuccess(false);
  }, [certData, uploadedFile]);

  const fileObj = currentFile;
  const fileUrl = typeof fileObj === 'string' ? fileObj : (fileObj?.dataUrl || fileObj?.url || null);
  const fileName = (typeof fileObj === 'object' && fileObj?.name) ? fileObj.name : 'Certificate_Document';
  const fileSize = (typeof fileObj === 'object' && fileObj?.size) ? fileObj.size : '';
  const fileType = (typeof fileObj === 'object' && fileObj?.type) ? fileObj.type : '';

  const isPdf = fileType.includes('pdf') || (typeof fileUrl === 'string' && fileUrl.startsWith('data:application/pdf')) || fileName.toLowerCase().endsWith('.pdf');
  const hasUploadedFile = Boolean(fileUrl);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownloadFile = () => {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || `${recipientName.replace(/\s+/g, '_')}_Certificate.${isPdf ? 'pdf' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    if (!fileUrl) return;
    const win = window.open();
    if (win) {
      if (isPdf) {
        win.document.write(
          `<iframe src="${fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      } else {
        win.document.write(
          `<body style="margin:0; background:#0b0f19; display:flex; justify-content:center; align-items:center; min-height:100vh;">
            <img src="${fileUrl}" style="max-width:98%; max-height:98vh; object-fit:contain; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-radius: 8px;" alt="Certificate" />
          </body>`
        );
      }
      win.document.title = `${recipientName} - ${certificateTitle}`;
    }
  };

  const handlePrint = () => {
    if (!fileUrl) return;
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
            <body style="margin:0; display:flex; justify-content:center; align-items:center;">
              <img src="${fileUrl}" style="max-width:100%; max-height:100vh; object-fit:contain;" onload="window.print();" />
            </body>
          </html>
        `);
      }
    }
  };

  // Direct file attachment handler
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressed = await compressImageFile(file, 1200, 0.8);
      if (compressed) {
        setCurrentFile(compressed);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 4000);

        if (onAttachDocument) {
          const targetKey = credentialId || certData.id || certData.code || certificateTitle;
          await onAttachDocument(targetKey, compressed);
        }
      }
    } catch (err) {
      console.error("Certificate document attachment failed:", err);
      alert("Could not process file. Please upload an image or PDF.");
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
          maxHeight: isFullscreen ? '98vh' : '92vh',
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
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-light)', padding: '1rem 1.5rem', background: '#FAFAFC' }}>
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

        {/* Certificate Metadata Bar */}
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
          color: 'var(--text-secondary)'
        }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {hasUploadedFile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-teal)', fontWeight: 600, fontSize: '0.78rem' }}>
                <FileText size={14} />
                <span>{fileName} {fileSize ? `(${fileSize})` : ''}</span>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {isUploading ? (
                <><Loader2 size={13} className="spin-animate" /> Saving to DB...</>
              ) : (
                <><UploadCloud size={13} /> {hasUploadedFile ? 'Replace Document' : 'Attach Scan'}</>
              )}
            </button>
          </div>
        </div>

        {/* Certificate Display Area */}
        <div className="modal-body" style={{
          padding: '1.25rem',
          background: '#0B1120',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          flex: 1,
          minHeight: isFullscreen ? '78vh' : '480px',
          maxHeight: isFullscreen ? '85vh' : '65vh',
          position: 'relative'
        }}>
          {hasUploadedFile ? (
            isPdf ? (
              /* PDF Certificate Viewer */
              <div style={{ width: '100%', height: '100%', minHeight: '520px', borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF' }}>
                <iframe
                  src={fileUrl}
                  title={`Certificate - ${certificateTitle}`}
                  style={{ width: '100%', height: '100%', minHeight: '520px', border: 'none' }}
                />
              </div>
            ) : (
              /* Image Certificate Viewer */
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
                padding: '0.5rem'
              }}>
                <img
                  src={fileUrl}
                  alt={`Official Certificate for ${recipientName} - ${certificateTitle}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: isFullscreen ? '78vh' : '58vh',
                    objectFit: 'contain',
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.2s ease',
                    borderRadius: '8px',
                    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                />
              </div>
            )
          ) : (
            /* Empty State if No File was Uploaded */
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
                No Scanned Document Attached
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                This record is registered with verified credential metadata (<strong style={{ color: '#E2E8F0' }}>{credentialId}</strong>). You can attach the real certificate image or PDF scan below to store it in Supabase DB permanently.
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 1.4rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
                }}
              >
                {isUploading ? (
                  <><Loader2 size={18} className="spin-animate" /> Processing & Saving to DB...</>
                ) : (
                  <><UploadCloud size={18} /> Upload Certificate Document (Image / PDF)</>
                )}
              </button>

              <div style={{
                background: '#0F172A',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                fontSize: '0.8rem',
                color: '#CBD5E1',
                textAlign: 'left',
                border: '1px solid #334155'
              }}>
                <div><strong>Recipient:</strong> {recipientName} ({recipientRole})</div>
                <div style={{ marginTop: '0.25rem' }}><strong>Certificate:</strong> {certificateTitle}</div>
                <div style={{ marginTop: '0.25rem' }}><strong>Issuer:</strong> {issuer}</div>
                <div style={{ marginTop: '0.25rem' }}><strong>Date:</strong> {issueDate} • <strong>Grade:</strong> {grade}</div>
              </div>
            </div>
          )}

          {/* Floating Image Controls for Image Certificates */}
          {hasUploadedFile && !isPdf && (
            <div style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(15, 23, 42, 0.85)',
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
            {hasUploadedFile ? (
              <>
                <button
                  className="btn btn-outline"
                  onClick={handlePrint}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={15} /> Print
                </button>
                <button
                  className="btn btn-outline"
                  onClick={handleOpenInNewTab}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-teal)', borderColor: '#99F6E4', background: '#F0FDFA' }}
                >
                  <ExternalLink size={15} /> Open in New Tab
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleDownloadFile}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Download size={15} /> Download Real Certificate
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {isUploading ? <Loader2 size={15} className="spin-animate" /> : <UploadCloud size={15} />}
                Upload Document Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

