-- ============================================================================
-- Fix Patients RLS Policies
-- ============================================================================
-- This migration fixes RLS policies for patients table to use user_profiles.role
-- instead of the user_roles table, and includes clinic_manager
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Admins and receptionists can view all patients" ON public.patients;
DROP POLICY IF EXISTS "Therapists can view their assigned patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can view their own data" ON public.patients;
DROP POLICY IF EXISTS "Admins and receptionists can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Therapists can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Admins and receptionists can update all patients" ON public.patients;
DROP POLICY IF EXISTS "Therapists can update their assigned patients" ON public.patients;
DROP POLICY IF EXISTS "Patients can update their own data" ON public.patients;
DROP POLICY IF EXISTS "Only admins can delete patients" ON public.patients;

-- Drop old generic policies if they exist
DROP POLICY IF EXISTS "Users can view patients from their clinic" ON public.patients;
DROP POLICY IF EXISTS "Authorized users can create patients" ON public.patients;
DROP POLICY IF EXISTS "Admin can update all patients" ON public.patients;
DROP POLICY IF EXISTS "Therapists can update assigned patients" ON public.patients;
DROP POLICY IF EXISTS "Only admin can delete patients" ON public.patients;

-- SELECT policies
CREATE POLICY "Users can view patients from their clinic"
ON public.patients FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
  )
);

-- INSERT policies
CREATE POLICY "Clinic staff can insert patients"
ON public.patients FOR INSERT
WITH CHECK (
  clinic_id IN (
    SELECT clinic_id FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('clinic_manager', 'admin', 'receptionist', 'therapist')
  )
);

-- UPDATE policies
CREATE POLICY "Clinic managers and admins can update all patients"
ON public.patients FOR UPDATE
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('clinic_manager', 'admin')
  )
);

CREATE POLICY "Therapists and receptionists can update patients"
ON public.patients FOR UPDATE
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('therapist', 'receptionist')
  )
);

-- DELETE policies
CREATE POLICY "Only clinic managers and admins can delete patients"
ON public.patients FOR DELETE
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('clinic_manager', 'admin', 'super_admin')
  )
);

-- Add comments
COMMENT ON POLICY "Users can view patients from their clinic" ON public.patients
IS 'All users can view patients from their own clinic';

COMMENT ON POLICY "Clinic staff can insert patients" ON public.patients
IS 'Clinic managers, admins, receptionists, and therapists can create patients';

COMMENT ON POLICY "Clinic managers and admins can update all patients" ON public.patients
IS 'Clinic managers and admins can update any patient in their clinic';

COMMENT ON POLICY "Therapists and receptionists can update patients" ON public.patients
IS 'Therapists and receptionists can update patients';

COMMENT ON POLICY "Only clinic managers and admins can delete patients" ON public.patients
IS 'Only clinic managers, admins, and super admins can delete patients';
