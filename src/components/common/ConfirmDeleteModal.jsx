import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmDeleteModal = ({ isOpen, title, message, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '0', overflow: 'hidden' }}
      >
        <div style={{
          padding: '1.5rem',
          textAlign: 'center',
          background: '#FFF1F2',
          borderBottom: '1px solid #FFE4E6'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#FFE4E6',
            color: 'var(--accent-rose)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <AlertTriangle size={28} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#9F1239', fontWeight: 800 }}>
            Confirm Deletion
          </h3>
        </div>

        <div style={{ padding: '1.5rem 1.75rem', textAlign: 'center' }}>
          <p style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem'
          }}>
            {title ? `Delete "${title}"?` : 'Delete this item?'}
          </p>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            margin: 0
          }}>
            {message || 'This record will be permanently removed and changes will sync across all devices.'}
          </p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          padding: '1rem 1.5rem',
          background: 'var(--bg-surface-subtle)',
          borderTop: '1px solid var(--border-light)'
        }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            style={{ minWidth: '90px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            style={{
              minWidth: '120px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Trash2 size={16} /> Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};
