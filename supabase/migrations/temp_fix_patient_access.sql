-- ============================================================================
-- TEMPORARY FIX: Bypass RLS for debugging patient access
-- ============================================================================
-- WARNING: This is a TEMPORARY solution for debugging only
-- Remove this after identifying the root cause
-- ============================================================================

-- Option 1: Temporarily disable RLS on patients table (NOT RECOMMENDED for production)
-- ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;

-- Option 2: Add a permissive policy that allows all authenticated users to see patients
-- This is safer than disabling RLS completely
DROP POLICY IF EXISTS "TEMP_DEBUG_allow_all_authenticated" ON public.patients;

CREATE POLICY "TEMP_DEBUG_allow_all_authenticated"
ON public.patients FOR SELECT
TO authenticated
USING (true);

-- To remove this temporary policy later, run:
-- DROP POLICY IF EXISTS "TEMP_DEBUG_allow_all_authenticated" ON public.patients;
