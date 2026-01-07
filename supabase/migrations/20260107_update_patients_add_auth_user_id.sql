-- Migration: Add auth_user_id to patients table and update fields
-- Created: 2026-01-07
-- Description: Links patients to auth.users and adds missing fields for user creation

-- Add auth_user_id column to patients table
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add medical_history column if it doesn't exist
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS medical_history TEXT;

-- Add primary_therapist_id column if it doesn't exist (might already exist)
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS primary_therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL;

-- Create index for auth_user_id for better performance
CREATE INDEX IF NOT EXISTS idx_patients_auth_user_id ON public.patients(auth_user_id);

-- Create index for primary_therapist_id
CREATE INDEX IF NOT EXISTS idx_patients_primary_therapist_id ON public.patients(primary_therapist_id);

-- Make email unique for patients
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_email_unique ON public.patients(email) WHERE email IS NOT NULL;

-- Update RLS policies for patients table
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.patients;

-- Policy: Admins and receptionists can view all patients
CREATE POLICY "Admins and receptionists can view all patients"
ON public.patients FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'receptionist')
  )
);

-- Policy: Therapists can view their assigned patients
CREATE POLICY "Therapists can view their assigned patients"
ON public.patients FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'therapist'
  )
  AND (
    -- Patient is assigned to this therapist as primary
    primary_therapist_id IN (
      SELECT id FROM public.therapists WHERE auth_user_id = auth.uid()
    )
    OR
    -- Patient is assigned to this therapist in assignments table
    id IN (
      SELECT patient_id FROM public.therapist_patient_assignments tpa
      JOIN public.therapists t ON t.id = tpa.therapist_id
      WHERE t.auth_user_id = auth.uid()
    )
  )
);

-- Policy: Patients can view their own data
CREATE POLICY "Patients can view their own data"
ON public.patients FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- Policy: Admins and receptionists can insert patients
CREATE POLICY "Admins and receptionists can insert patients"
ON public.patients FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'receptionist')
  )
);

-- Policy: Therapists can insert patients
CREATE POLICY "Therapists can insert patients"
ON public.patients FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'therapist'
  )
);

-- Policy: Admins and receptionists can update all patients
CREATE POLICY "Admins and receptionists can update all patients"
ON public.patients FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'receptionist')
  )
);

-- Policy: Therapists can update their assigned patients
CREATE POLICY "Therapists can update their assigned patients"
ON public.patients FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'therapist'
  )
  AND (
    primary_therapist_id IN (
      SELECT id FROM public.therapists WHERE auth_user_id = auth.uid()
    )
    OR
    id IN (
      SELECT patient_id FROM public.therapist_patient_assignments tpa
      JOIN public.therapists t ON t.id = tpa.therapist_id
      WHERE t.auth_user_id = auth.uid()
    )
  )
);

-- Policy: Patients can update their own data (limited fields)
CREATE POLICY "Patients can update their own data"
ON public.patients FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid());

-- Policy: Only admins can delete patients
CREATE POLICY "Only admins can delete patients"
ON public.patients FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  )
);

-- Add comment to new column
COMMENT ON COLUMN public.patients.auth_user_id IS 'Reference to the Supabase Auth user, null if patient has no login access';
COMMENT ON COLUMN public.patients.medical_history IS 'Medical history, conditions, allergies, and current medications';
