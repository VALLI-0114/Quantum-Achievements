-- ==============================================================================
-- Q-HUB QUANTUM COMPUTING PORTAL - COMPLETE MULTI-TABLE DATABASE SCHEMA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lzwojngbqvsojdburrps/sql/new
--
-- This creates individual tables for Faculty, Students, Courses, Certificates,
-- Projects, Research Papers, and Hackathons, enabling individual row management
-- in the Supabase Table Editor.
-- ==============================================================================

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

-- 8. UNIFIED REALTIME SYNC TABLE (FOR FAST ATOMIC CACHING)
CREATE TABLE IF NOT EXISTS public.quantum_portal_data (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_portal_data ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- CREATE PUBLIC ACCESS POLICIES (ALLOW SELECT, INSERT, UPDATE, DELETE)
-- ==============================================================================

-- Faculty Policies
DROP POLICY IF EXISTS "Allow public all on faculty" ON public.faculty;
CREATE POLICY "Allow public all on faculty" ON public.faculty FOR ALL USING (true) WITH CHECK (true);

-- Students Policies
DROP POLICY IF EXISTS "Allow public all on students" ON public.students;
CREATE POLICY "Allow public all on students" ON public.students FOR ALL USING (true) WITH CHECK (true);

-- Courses Policies
DROP POLICY IF EXISTS "Allow public all on courses" ON public.courses;
CREATE POLICY "Allow public all on courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);

-- Certificates Policies
DROP POLICY IF EXISTS "Allow public all on certificates" ON public.certificates;
CREATE POLICY "Allow public all on certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

-- Projects Policies
DROP POLICY IF EXISTS "Allow public all on projects" ON public.projects;
CREATE POLICY "Allow public all on projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

-- Research Papers Policies
DROP POLICY IF EXISTS "Allow public all on research_papers" ON public.research_papers;
CREATE POLICY "Allow public all on research_papers" ON public.research_papers FOR ALL USING (true) WITH CHECK (true);

-- Hackathons Policies
DROP POLICY IF EXISTS "Allow public all on hackathons" ON public.hackathons;
CREATE POLICY "Allow public all on hackathons" ON public.hackathons FOR ALL USING (true) WITH CHECK (true);

-- Unified Portal Data Policies
DROP POLICY IF EXISTS "Allow public all on quantum_portal_data" ON public.quantum_portal_data;
CREATE POLICY "Allow public all on quantum_portal_data" ON public.quantum_portal_data FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- ENABLE REALTIME BROADCASTING ON ALL TABLES
-- ==============================================================================
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
        -- already added
        NULL;
    END;
END $$;
