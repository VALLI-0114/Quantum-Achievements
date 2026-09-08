import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Database, Sparkles, CheckCircle2, Layers } from 'lucide-react';

export const SupabaseSetupModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- ==============================================================================
-- Q-HUB QUANTUM COMPUTING PORTAL - COMPLETE MULTI-TABLE DATABASE SCHEMA
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lzwojngbqvsojdburrps/sql/new

-- 1. FACULTY TABLE
CREATE TABLE IF NOT EXISTS public.faculty (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    title TEXT NOT NULL DEFAULT 'Faculty Member',
    email TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    name TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    year TEXT DEFAULT 'Student',
    email TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    category TEXT,
    description TEXT,
    faculty_completions JSONB DEFAULT '[]'::jsonb,
    faculty_enrolled JSONB DEFAULT '[]'::jsonb,
    student_completions JSONB DEFAULT '[]'::jsonb,
    student_enrolled JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    code TEXT,
    verification_url TEXT,
    faculty_recipients JSONB DEFAULT '[]'::jsonb,
    student_recipients JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    domain TEXT,
    tech_stack JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    status TEXT DEFAULT 'Active Development',
    github_url TEXT,
    faculty_involved JSONB DEFAULT '[]'::jsonb,
    students_involved JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RESEARCH PAPERS TABLE
CREATE TABLE IF NOT EXISTS public.research_papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    venue TEXT,
    doi TEXT,
    research_area TEXT,
    abstract TEXT,
    citations INTEGER DEFAULT 0,
    date TEXT,
    faculty_authors JSONB DEFAULT '[]'::jsonb,
    student_authors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. HACKATHONS TABLE
CREATE TABLE IF NOT EXISTS public.hackathons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organizer TEXT,
    edition TEXT,
    date TEXT,
    faculty_participants JSONB DEFAULT '[]'::jsonb,
    student_participants JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. UNIFIED REALTIME SYNC TABLE
CREATE TABLE IF NOT EXISTS public.quantum_portal_data (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_portal_data ENABLE ROW LEVEL SECURITY;

-- CREATE PUBLIC ACCESS POLICIES (ALLOW ALL)
DROP POLICY IF EXISTS "Allow public all on faculty" ON public.faculty;
CREATE POLICY "Allow public all on faculty" ON public.faculty FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on students" ON public.students;
CREATE POLICY "Allow public all on students" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on courses" ON public.courses;
CREATE POLICY "Allow public all on courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on certificates" ON public.certificates;
CREATE POLICY "Allow public all on certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on projects" ON public.projects;
CREATE POLICY "Allow public all on projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on research_papers" ON public.research_papers;
CREATE POLICY "Allow public all on research_papers" ON public.research_papers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on hackathons" ON public.hackathons;
CREATE POLICY "Allow public all on hackathons" ON public.hackathons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on quantum_portal_data" ON public.quantum_portal_data;
CREATE POLICY "Allow public all on quantum_portal_data" ON public.quantum_portal_data FOR ALL USING (true) WITH CHECK (true);

-- ENABLE REALTIME ON ALL TABLES
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE 
            public.faculty,
            public.students,
            public.courses,
            public.certificates,
            public.projects,
            public.research_papers,
            public.hackathons,
            public.quantum_portal_data;
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END $$;`;

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
              <Layers size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Setup Separate Supabase Tables</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Creates tables for Faculty, Students, Courses, Certificates, Projects, Papers & Hackathons
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
              ⚡ Run in Supabase SQL Editor (Takes 10 Seconds)
            </h4>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#047857', lineHeight: 1.6 }}>
              <li>Click <strong>"Copy SQL Script"</strong> below.</li>
              <li>Click <strong>"Open Supabase SQL Editor"</strong>.</li>
              <li>Paste into the editor and click <strong>"Run"</strong>. All tables will appear in your Supabase Table Editor!</li>
            </ol>
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Multi-Table SQL Script:
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
