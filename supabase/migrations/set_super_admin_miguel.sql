-- ============================================================================
-- Set miguel.lopez@rod.com.mx as Super Admin
-- ============================================================================
-- Execute this in Supabase SQL Editor
-- ============================================================================

-- Step 1: Verify current user status
SELECT
  up.id,
  au.email,
  up.full_name,
  up.role,
  up.clinic_id,
  up.professional_title,
  up.is_active
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'miguel.lopez@rod.com.mx';

-- Step 2: Update to super_admin
UPDATE public.user_profiles
SET
  role = 'super_admin',
  clinic_id = NULL,
  professional_title = 'Administrador de Plataforma',
  is_active = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'miguel.lopez@rod.com.mx'
);

-- Step 3: Verify the change worked
SELECT
  up.id,
  au.email,
  up.full_name,
  up.role,
  up.clinic_id,
  up.professional_title,
  up.is_active
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'miguel.lopez@rod.com.mx';

-- ============================================================================
-- Expected result after Step 3:
-- - role: super_admin
-- - clinic_id: NULL
-- - professional_title: Administrador de Plataforma
-- - is_active: true
-- ============================================================================
