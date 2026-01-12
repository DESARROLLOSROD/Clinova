-- ============================================================================
-- Create Super Admin User
-- ============================================================================
-- This script converts your existing user to super_admin role
-- Run this AFTER the main migration (20260112_add_super_admin_role.sql)
-- ============================================================================

-- Step 1: Find your user ID
-- ============================================================================
-- First, let's see all current users to find yours
SELECT id, email, 
       (SELECT full_name FROM public.user_profiles WHERE id = auth.users.id) as name,
       (SELECT role FROM public.user_profiles WHERE id = auth.users.id) as current_role
FROM auth.users
ORDER BY created_at DESC;

-- Step 2: Update your user to super_admin
-- ============================================================================
-- Replace 'YOUR_EMAIL_HERE' with your actual email from the query above

-- IMPORTANT: Uncomment and run this after confirming your email
/*
UPDATE public.user_profiles
SET 
  role = 'super_admin',
  clinic_id = NULL,  -- Super admin doesn't belong to a specific clinic
  professional_title = 'Administrador de Plataforma'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);
*/

-- Step 3: Verify the change
-- ============================================================================
-- Check that your user is now super_admin
SELECT 
  up.id,
  au.email,
  up.full_name,
  up.role,
  up.clinic_id,
  up.professional_title
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE up.role = 'super_admin';

-- ============================================================================
-- After running this, you should:
-- 1. Logout from the application
-- 2. Login again with your credentials
-- 3. You will be automatically redirected to /super-admin/dashboard
-- 4. You can now create and manage multiple clinics!
-- ============================================================================
