-- ============================================================================
-- MIGRATION: Add Super Admin and Clinic Manager Roles
-- ============================================================================
-- This migration adds the new role hierarchy for multi-tenant SaaS:
-- - super_admin: Platform owner, can manage all clinics
-- - clinic_manager: Clinic owner, manages their specific clinic
-- - Existing roles: therapist, receptionist, patient remain unchanged
-- ============================================================================

-- Step 1: Drop existing role constraint FIRST (before migrating data)
-- ============================================================================

-- Drop existing check constraint so we can update the data
ALTER TABLE public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Step 2: Migrate existing 'admin' users to 'clinic_manager'
-- ============================================================================
-- Now we can safely update the roles

UPDATE public.user_profiles
SET role = 'clinic_manager'
WHERE role = 'admin';

-- Verify the migration
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.user_profiles WHERE role = 'admin';
  IF admin_count > 0 THEN
    RAISE NOTICE 'Warning: % users still have role "admin"', admin_count;
  ELSE
    RAISE NOTICE 'Success: All admin users migrated to clinic_manager';
  END IF;
END $$;

-- Step 3: Add new check constraint with all roles
-- ============================================================================

-- Now add the new constraint with the updated role list
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('super_admin', 'clinic_manager', 'therapist', 'receptionist', 'patient'));

-- Step 4: Make clinic_id nullable for super_admin users
-- ============================================================================

-- Super admins don't belong to a specific clinic
ALTER TABLE public.user_profiles 
ALTER COLUMN clinic_id DROP NOT NULL;

-- Note: We don't add a check constraint for clinic_id because:
-- 1. RLS policies will enforce the business logic
-- 2. It's more flexible for future role additions
-- 3. Avoids migration issues with existing data


-- Step 5: Update RLS helper functions
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

-- Step 6: Update RLS policies for clinics table
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

-- Step 7: Update RLS policies for user_profiles
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

-- Step 8: Update RLS policies for core tables to allow super_admin access
-- ============================================================================
-- Note: We only update policies for tables we know exist with clinic_id
-- Other tables will keep their existing RLS policies

-- Super admin can view all user profiles (already done in Step 7)
-- Super admin can view all clinics (already done in Step 6)

-- For other tables, super admin access will be granted through existing policies
-- that check for admin role (which now includes both super_admin and clinic_manager)
-- via the updated is_admin() function

-- Patients table (if it has clinic_id)
DROP POLICY IF EXISTS "Super admin can manage all patients" ON public.patients;
CREATE POLICY "Super admin can manage all patients"
ON public.patients FOR ALL
USING (is_super_admin());

-- Note: Other table policies will be updated manually as needed
-- based on your specific schema structure


-- Step 9: Add comments for documentation
-- ============================================================================

COMMENT ON CONSTRAINT user_profiles_role_check ON public.user_profiles IS 
'Allowed roles: super_admin (platform owner), clinic_manager (clinic owner), therapist, receptionist, patient';

-- Note: clinic_id validation is handled by RLS policies, not by a check constraint


COMMENT ON FUNCTION is_super_admin() IS 
'Returns true if current user is a super admin (platform owner)';

COMMENT ON FUNCTION is_clinic_manager() IS 
'Returns true if current user is a clinic manager (clinic owner)';

-- Step 10: Create initial super admin user (OPTIONAL - run manually)
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

-- Step 11: Verification - Check migrated users
-- ============================================================================

-- Uncomment to verify after migration completes:
/*
SELECT id, full_name, role, clinic_id, created_at
FROM public.user_profiles
WHERE role = 'clinic_manager'
ORDER BY created_at DESC;
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

