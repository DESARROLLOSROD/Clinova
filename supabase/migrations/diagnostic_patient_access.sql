-- ============================================================================
-- Diagnostic Script: Check User Access to Patients
-- ============================================================================
-- Run this in Supabase SQL Editor to diagnose patient access issues
-- ============================================================================

-- 1. Check current user's profile
SELECT 
    id,
    full_name,
    role,
    clinic_id,
    is_active
FROM public.user_profiles
WHERE id = auth.uid();

-- 2. Check if user has a clinic assigned
SELECT 
    up.id as user_id,
    up.full_name,
    up.role,
    up.clinic_id,
    c.name as clinic_name,
    c.is_active as clinic_active
FROM public.user_profiles up
LEFT JOIN public.clinics c ON c.id = up.clinic_id
WHERE up.id = auth.uid();

-- 3. Check patients in user's clinic
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.clinic_id,
    c.name as clinic_name,
    p.active
FROM public.patients p
LEFT JOIN public.clinics c ON c.id = p.clinic_id
WHERE p.clinic_id IN (
    SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
)
LIMIT 10;

-- 4. Check RLS policies on patients table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'patients';

-- 5. Check total patients count (requires RLS bypass or superuser)
SELECT 
    COUNT(*) as total_patients,
    COUNT(DISTINCT clinic_id) as total_clinics
FROM public.patients;

-- 6. Test helper functions
SELECT 
    public.current_user_role() as my_role,
    public.current_user_clinic() as my_clinic_id,
    public.is_admin() as am_i_admin;

