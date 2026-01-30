-- ============================================================================
-- Fix: Patient Portal Access Policies
-- ============================================================================
-- Ensures patients can access their own data in the portal.
-- The existing clinic-based policies work for staff, but patients need
-- explicit self-access policies as a fallback.
-- ============================================================================

-- 1. Patients can view their own record in the patients table
DROP POLICY IF EXISTS "Patients can view their own data" ON public.patients;
CREATE POLICY "Patients can view their own data"
ON public.patients FOR SELECT TO authenticated
USING (auth_user_id = auth.uid());

-- 2. Patients can view their own appointments
DROP POLICY IF EXISTS "Patients can view their own appointments" ON public.appointments;
CREATE POLICY "Patients can view their own appointments"
ON public.appointments FOR SELECT TO authenticated
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
  )
);

-- 3. Patients can view their own exercise prescriptions
DROP POLICY IF EXISTS "Patients can view their own prescriptions" ON public.patient_exercise_prescriptions;
CREATE POLICY "Patients can view their own prescriptions"
ON public.patient_exercise_prescriptions FOR SELECT TO authenticated
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE auth_user_id = auth.uid()
  )
);

-- 4. Patients can view their own profile in user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT TO authenticated
USING (id = auth.uid());
