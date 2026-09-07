import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Database, Sparkles, CheckCircle2 } from 'lucide-react';

export const SupabaseSetupModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- 1. Create the unified realtime portal data table
CREATE TABLE IF NOT EXISTS public.quantum_portal_data (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.quantum_portal_data ENABLE ROW LEVEL SECURITY;

-- 3. Create Public Access Policies for Cross-Device Sync
DROP POLICY IF EXISTS "Allow public read access" ON public.quantum_portal_data;
CREATE POLICY "Allow public read access" ON public.quantum_portal_data 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON public.quantum_portal_data;
CREATE POLICY "Allow public insert access" ON public.quantum_portal_data 
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON public.quantum_portal_data;
CREATE POLICY "Allow public update access" ON public.quantum_portal_data 
FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON public.quantum_portal_data;
CREATE POLICY "Allow public delete access" ON public.quantum_portal_data 
FOR DELETE USING (true);

-- 4. Enable Realtime Publications for instant multi-device broadcasting
ALTER PUBLICATION supabase_realtime ADD TABLE public.quantum_portal_data;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Setup Supabase Cloud Table</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Enable permanent multi-device sync across all phones & computers
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
            border: '1px solid #A7F3D0',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem'
          }}>
            <h4 style={{ fontSize: '0.92rem', color: '#065F46', margin: '0 0 0.35rem', fontWeight: 700 }}>
              ⚡ 2-Step Quick Setup (Takes 10 Seconds)
            </h4>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#047857', lineHeight: 1.6 }}>
              <li>Copy the SQL script below.</li>
              <li>Open your Supabase SQL Editor and click <strong>"Run"</strong>.</li>
            </ol>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                SQL Query for Supabase SQL Editor:
              </span>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleCopy}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}
              </button>
            </div>

            <pre style={{
              background: '#0F172A',
              color: '#F8FAFC',
              borderRadius: '10px',
              padding: '1rem',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              overflowX: 'auto',
              maxHeight: '260px',
              border: '1px solid #334155'
            }}>
              <code>{sqlCode}</code>
            </pre>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a
            href="https://supabase.com/dashboard/project/lzwojngbqvsojdburrps/sql/new"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <ExternalLink size={15} /> Open Supabase SQL Editor ↗
          </a>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
