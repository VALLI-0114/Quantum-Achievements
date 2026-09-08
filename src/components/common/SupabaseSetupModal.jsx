import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Database, Sparkles, CheckCircle2, Layers } from 'lucide-react';

export const SupabaseSetupModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- ==============================================================================
-- Q-HUB QUANTUM COMPUTING PORTAL - DEDICATED FACULTY & STUDENT SCHEMA
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lzwojngbqvsojdburrps/sql/new

-- 1. FACULTY TABLES
CREATE TABLE IF NOT EXISTS public.faculty (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    title TEXT NOT NULL DEFAULT 'Faculty Member',
    email TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.faculty_courses (
    id TEXT PRIMARY KEY,
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    provider TEXT NOT NULL,
    category TEXT,
    description TEXT,
    faculty_name TEXT,
    faculty_id TEXT,
    completion_date TEXT,
    grade TEXT,
    certificate_id TEXT,
    status TEXT DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.faculty_certificates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    code TEXT,
    faculty_name TEXT,
    faculty_id TEXT,
    credential_id TEXT,
    issue_date TEXT,
    score TEXT,
    verification_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.faculty_projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    domain TEXT,
    tech_stack TEXT,
    description TEXT,
    status TEXT DEFAULT 'Active Development',
    github_url TEXT,
    faculty_name TEXT,
    faculty_id TEXT,
    role TEXT DEFAULT 'Principal Investigator / Research Advisor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.faculty_papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    venue TEXT,
    doi TEXT,
    research_area TEXT,
    abstract TEXT,
    citations INTEGER DEFAULT 0,
    date TEXT,
    faculty_name TEXT,
    faculty_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.faculty_hackathons (
    id TEXT PRIMARY KEY,
    hackathon_name TEXT NOT NULL,
    organizer TEXT,
    edition TEXT,
    date TEXT,
    faculty_name TEXT,
    faculty_id TEXT,
    team_name TEXT,
    project_built TEXT,
    award TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. STUDENT TABLES
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

CREATE TABLE IF NOT EXISTS public.student_courses (
    id TEXT PRIMARY KEY,
    course_code TEXT NOT NULL,
    course_name TEXT NOT NULL,
    provider TEXT NOT NULL,
    category TEXT,
    description TEXT,
    student_name TEXT,
    student_id TEXT,
    completion_date TEXT,
    grade TEXT,
    certificate_id TEXT,
    status TEXT DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_certificates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    code TEXT,
    student_name TEXT,
    student_id TEXT,
    credential_id TEXT,
    issue_date TEXT,
    score TEXT,
    verification_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    domain TEXT,
    tech_stack TEXT,
    description TEXT,
    status TEXT DEFAULT 'Active Development',
    github_url TEXT,
    student_name TEXT,
    student_id TEXT,
    role TEXT DEFAULT 'Project Lead & Developer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    venue TEXT,
    doi TEXT,
    research_area TEXT,
    abstract TEXT,
    citations INTEGER DEFAULT 0,
    date TEXT,
    student_name TEXT,
    student_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_hackathons (
    id TEXT PRIMARY KEY,
    hackathon_name TEXT NOT NULL,
    organizer TEXT,
    edition TEXT,
    date TEXT,
    student_name TEXT,
    student_id TEXT,
    team_name TEXT,
    project_built TEXT,
    award TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. UNIFIED REALTIME SYNC TABLE
CREATE TABLE IF NOT EXISTS public.quantum_portal_data (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ENABLE RLS
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_hackathons ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_hackathons ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.quantum_portal_data ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES
DROP POLICY IF EXISTS "Allow public all on faculty" ON public.faculty;
CREATE POLICY "Allow public all on faculty" ON public.faculty FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on faculty_courses" ON public.faculty_courses;
CREATE POLICY "Allow public all on faculty_courses" ON public.faculty_courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on faculty_certificates" ON public.faculty_certificates;
CREATE POLICY "Allow public all on faculty_certificates" ON public.faculty_certificates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on faculty_projects" ON public.faculty_projects;
CREATE POLICY "Allow public all on faculty_projects" ON public.faculty_projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on faculty_papers" ON public.faculty_papers;
CREATE POLICY "Allow public all on faculty_papers" ON public.faculty_papers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on faculty_hackathons" ON public.faculty_hackathons;
CREATE POLICY "Allow public all on faculty_hackathons" ON public.faculty_hackathons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on students" ON public.students;
CREATE POLICY "Allow public all on students" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on student_courses" ON public.student_courses;
CREATE POLICY "Allow public all on student_courses" ON public.student_courses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on student_certificates" ON public.student_certificates;
CREATE POLICY "Allow public all on student_certificates" ON public.student_certificates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on student_projects" ON public.student_projects;
CREATE POLICY "Allow public all on student_projects" ON public.student_projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on student_papers" ON public.student_papers;
CREATE POLICY "Allow public all on student_papers" ON public.student_papers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on student_hackathons" ON public.student_hackathons;
CREATE POLICY "Allow public all on student_hackathons" ON public.student_hackathons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on quantum_portal_data" ON public.quantum_portal_data;
CREATE POLICY "Allow public all on quantum_portal_data" ON public.quantum_portal_data FOR ALL USING (true) WITH CHECK (true);

-- 6. REALTIME
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE 
            public.faculty,
            public.faculty_courses,
            public.faculty_certificates,
            public.faculty_projects,
            public.faculty_papers,
            public.faculty_hackathons,
            public.students,
            public.student_courses,
            public.student_certificates,
            public.student_projects,
            public.student_papers,
            public.student_hackathons,
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
