-- ============================================================================
-- Allow Clinic Managers to Access Clinical Features
-- ============================================================================
-- This migration updates RLS functions to allow clinic_manager role to:
-- - View and create sessions (SOAP notes)
-- - View and manage appointments as therapists
-- - Access all clinical features that therapists have
-- ============================================================================

-- Update is_admin function to include clinic_manager
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'clinic_manager')
    LIMIT 1
  );
$$;

-- Update can_access_clinical_notes to include clinic_manager
CREATE OR REPLACE FUNCTION public.can_access_clinical_notes()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'therapist', 'clinic_manager')
    LIMIT 1
  );
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if current user is admin or clinic_manager';
COMMENT ON FUNCTION public.can_access_clinical_notes() IS 'Returns true if current user can access clinical notes (admin, therapist, or clinic_manager)';
