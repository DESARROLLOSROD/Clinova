-- ============================================================================
-- MIGRATION: Add Super Admin and Clinic Manager Roles
-- ============================================================================
-- This migration adds the new role hierarchy for multi-tenant SaaS:
-- - super_admin: Platform owner, can manage all clinics
-- - clinic_manager: Clinic owner, manages their specific clinic
-- - Existing roles: therapist, receptionist, patient remain unchanged
-- ============================================================================

-- Step 1: Update user_profiles table to support new roles
-- ============================================================================

-- Drop existing check constraint
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Add new check constraint with all roles
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('super_admin', 'clinic_manager', 'therapist', 'receptionist', 'patient'));

-- Step 2: Make clinic_id nullable for super_admin users
-- ============================================================================

-- Super admins don't belong to a specific clinic
ALTER TABLE public.user_profiles 
ALTER COLUMN clinic_id DROP NOT NULL;

-- Add check: super_admin can have null clinic_id, others must have clinic_id
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_clinic_id_check
CHECK (
  (role = 'super_admin' AND clinic_id IS NULL) OR
  (role != 'super_admin' AND clinic_id IS NOT NULL)
);

-- Step 3: Update RLS helper functions
-- ============================================================================

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'super_admin'
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is clinic manager
CREATE OR REPLACE FUNCTION is_clinic_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'clinic_manager'
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update existing is_admin function to check for clinic_manager
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('super_admin', 'clinic_manager')
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 4: Update RLS policies for clinics table
-- ============================================================================

-- Super admin can view all clinics
DROP POLICY IF EXISTS "Super admin can view all clinics" ON public.clinics;
CREATE POLICY "Super admin can view all clinics"
ON public.clinics FOR SELECT
USING (is_super_admin());

-- Super admin can create clinics
DROP POLICY IF EXISTS "Super admin can create clinics" ON public.clinics;
CREATE POLICY "Super admin can create clinics"
ON public.clinics FOR INSERT
WITH CHECK (is_super_admin());

-- Super admin can update all clinics
DROP POLICY IF EXISTS "Super admin can update all clinics" ON public.clinics;
CREATE POLICY "Super admin can update all clinics"
ON public.clinics FOR UPDATE
USING (is_super_admin());

-- Super admin can delete clinics
DROP POLICY IF EXISTS "Super admin can delete clinics" ON public.clinics;
CREATE POLICY "Super admin can delete clinics"
ON public.clinics FOR DELETE
USING (is_super_admin());

-- Clinic managers can view their own clinic (keep existing policy)
-- Already exists: "Users can view their own clinic"

-- Clinic managers can update their own clinic
DROP POLICY IF EXISTS "Admins can update their clinic" ON public.clinics;
DROP POLICY IF EXISTS "Clinic managers can update their clinic" ON public.clinics;
CREATE POLICY "Clinic managers can update their clinic"
ON public.clinics FOR UPDATE
USING (id = get_user_clinic_id() AND is_clinic_manager());

-- Step 5: Update RLS policies for user_profiles
-- ============================================================================

-- Super admin can view all user profiles
DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.user_profiles;
CREATE POLICY "Super admin can view all profiles"
ON public.user_profiles FOR SELECT
USING (is_super_admin());

-- Super admin can create any user profile
DROP POLICY IF EXISTS "Super admin can create profiles" ON public.user_profiles;
CREATE POLICY "Super admin can create profiles"
ON public.user_profiles FOR INSERT
WITH CHECK (is_super_admin());

-- Super admin can update any user profile
DROP POLICY IF EXISTS "Super admin can update profiles" ON public.user_profiles;
CREATE POLICY "Super admin can update profiles"
ON public.user_profiles FOR UPDATE
USING (is_super_admin());

-- Update existing policy for clinic managers
DROP POLICY IF EXISTS "Admins can insert user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Clinic managers can insert user profiles" ON public.user_profiles;
CREATE POLICY "Clinic managers can insert user profiles"
ON public.user_profiles FOR INSERT
WITH CHECK (clinic_id = get_user_clinic_id() AND is_clinic_manager());

DROP POLICY IF EXISTS "Admins can update user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Clinic managers can update user profiles" ON public.user_profiles;
CREATE POLICY "Clinic managers can update user profiles"
ON public.user_profiles FOR UPDATE
USING (clinic_id = get_user_clinic_id() AND is_clinic_manager());

-- Step 6: Update RLS policies for all other tables to allow super_admin access
-- ============================================================================

-- Therapists
DROP POLICY IF EXISTS "Super admin can manage all therapists" ON public.therapists;
CREATE POLICY "Super admin can manage all therapists"
ON public.therapists FOR ALL
USING (is_super_admin());

-- Update existing admin policy to use clinic_manager
DROP POLICY IF EXISTS "Admins can manage therapists" ON public.therapists;
DROP POLICY IF EXISTS "Clinic managers can manage therapists" ON public.therapists;
CREATE POLICY "Clinic managers can manage therapists"
ON public.therapists FOR ALL
USING (clinic_id = get_user_clinic_id() AND is_clinic_manager());

-- Patients
DROP POLICY IF EXISTS "Super admin can manage all patients" ON public.patients;
CREATE POLICY "Super admin can manage all patients"
ON public.patients FOR ALL
USING (is_super_admin());

-- Appointments
DROP POLICY IF EXISTS "Super admin can manage all appointments" ON public.appointments;
CREATE POLICY "Super admin can manage all appointments"
ON public.appointments FOR ALL
USING (is_super_admin());

-- Payments
DROP POLICY IF EXISTS "Super admin can manage all payments" ON public.payments;
CREATE POLICY "Super admin can manage all payments"
ON public.payments FOR ALL
USING (is_super_admin());

-- Sessions
DROP POLICY IF EXISTS "Super admin can manage all sessions" ON public.sessions;
CREATE POLICY "Super admin can manage all sessions"
ON public.sessions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_id
  )
  AND is_super_admin()
);

-- Treatment Templates
DROP POLICY IF EXISTS "Super admin can manage all templates" ON public.treatment_templates;
CREATE POLICY "Super admin can manage all templates"
ON public.treatment_templates FOR ALL
USING (is_super_admin());

-- Exercise Library
DROP POLICY IF EXISTS "Super admin can manage all exercises" ON public.exercise_library;
CREATE POLICY "Super admin can manage all exercises"
ON public.exercise_library FOR ALL
USING (is_super_admin());

-- Step 7: Add comments for documentation
-- ============================================================================

COMMENT ON CONSTRAINT user_profiles_role_check ON public.user_profiles IS 
'Allowed roles: super_admin (platform owner), clinic_manager (clinic owner), therapist, receptionist, patient';

COMMENT ON CONSTRAINT user_profiles_clinic_id_check ON public.user_profiles IS 
'Super admins have null clinic_id, all other roles must have a clinic_id';

COMMENT ON FUNCTION is_super_admin() IS 
'Returns true if current user is a super admin (platform owner)';

COMMENT ON FUNCTION is_clinic_manager() IS 
'Returns true if current user is a clinic manager (clinic owner)';

-- Step 8: Create initial super admin user (OPTIONAL - run manually)
-- ============================================================================

-- IMPORTANT: This is commented out. Run manually after migration with your actual user ID
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from auth.users

/*
-- First, create the user in Supabase Auth dashboard or via API
-- Then run this to create their profile:

INSERT INTO public.user_profiles (
  id,
  role,
  clinic_id,
  full_name,
  professional_title,
  is_active,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- Replace with your actual user ID
  'super_admin',
  NULL,  -- Super admin has no clinic
  'Tu Nombre',  -- Replace with your name
  'Administrador de Plataforma',
  true,
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  clinic_id = NULL,
  professional_title = 'Administrador de Plataforma';
*/

-- Step 9: Migration script to update existing admin users to clinic_manager
-- ============================================================================

-- IMPORTANT: Review this before running!
-- This will update all existing 'admin' users to 'clinic_manager'

/*
UPDATE public.user_profiles
SET role = 'clinic_manager'
WHERE role = 'admin';

-- Verify the update
SELECT id, full_name, role, clinic_id
FROM public.user_profiles
WHERE role = 'clinic_manager';
*/

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Verification queries (run these to check the migration)
/*
-- Check role constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'user_profiles_role_check';

-- Check clinic_id constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'user_profiles_clinic_id_check';

-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check helper functions
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name IN ('is_super_admin', 'is_clinic_manager', 'is_admin')
AND routine_schema = 'public';
*/
