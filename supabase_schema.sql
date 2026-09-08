-- ==============================================================================
-- Q-HUB QUANTUM COMPUTING PORTAL - DEDICATED FACULTY & STUDENT SCHEMA
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lzwojngbqvsojdburrps/sql/new
--
-- Creates completely separate tables for Faculty and Students across all categories:
-- Courses, Certificates, Projects, Research Papers, and Hackathons.
-- ==============================================================================

-- ==============================================================================
-- 1. FACULTY TABLES
-- ==============================================================================

-- Faculty Profiles
CREATE TABLE IF NOT EXISTS public.faculty (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL DEFAULT 'Computer Science & Engineering',
    title TEXT NOT NULL DEFAULT 'Faculty Member',
    email TEXT,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Faculty Courses
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

-- Faculty Certificates
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

-- Faculty Projects
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

-- Faculty Research Papers
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

-- Faculty Hackathons
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

-- ==============================================================================
-- 2. STUDENT TABLES
-- ==============================================================================

-- Student Profiles
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

-- Student Courses
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

-- Student Certificates
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

-- Student Projects
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

-- Student Research Papers
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

-- Student Hackathons
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

-- ==============================================================================
-- 3. UNIFIED REALTIME SYNC TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quantum_portal_data (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
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

-- ==============================================================================
-- 5. CREATE PUBLIC ACCESS POLICIES (ALLOW ALL FOR APP)
-- ==============================================================================

-- Faculty
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

-- Students
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

-- Unified Sync
DROP POLICY IF EXISTS "Allow public all on quantum_portal_data" ON public.quantum_portal_data;
CREATE POLICY "Allow public all on quantum_portal_data" ON public.quantum_portal_data FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 6. REALTIME BROADCASTING
-- ==============================================================================
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
END $$;
