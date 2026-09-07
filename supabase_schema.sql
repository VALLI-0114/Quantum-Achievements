-- =========================================================
-- Q-HUB QUANTUM PORTAL - SUPABASE CLOUD DATABASE SETUP
-- =========================================================
-- Paste and Run this SQL in your Supabase Dashboard:
-- https://supabase.com/dashboard/project/lzwojngbqvsojdburrps/sql/new

-- 1. Create the unified realtime portal data table
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
ALTER PUBLICATION supabase_realtime ADD TABLE public.quantum_portal_data;
