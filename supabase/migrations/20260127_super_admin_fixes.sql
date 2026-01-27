-- ============================================================================
-- MIGRATION: SUPER ADMIN PERMISSIONS FIX
-- Date: 2026-01-27
-- Description: Grants full WRITE access to Super Admins on core tables 
--              to allow "Impersonation Mode" to work for editing data.
-- ============================================================================

-- 1. Appointments
DROP POLICY IF EXISTS "Super admin can manage all appointments" ON public.appointments;
CREATE POLICY "Super admin can manage all appointments"
ON public.appointments FOR ALL
USING (is_super_admin());

-- 2. Sessions
DROP POLICY IF EXISTS "Super admin can manage all sessions" ON public.sessions;
CREATE POLICY "Super admin can manage all sessions"
ON public.sessions FOR ALL
USING (is_super_admin());

-- 3. Payments
DROP POLICY IF EXISTS "Super admin can manage all payments" ON public.payments;
CREATE POLICY "Super admin can manage all payments"
ON public.payments FOR ALL
USING (is_super_admin());

-- 4. Therapists
DROP POLICY IF EXISTS "Super admin can manage all therapists" ON public.therapists;
CREATE POLICY "Super admin can manage all therapists"
ON public.therapists FOR ALL
USING (is_super_admin());

-- 5. Treatment Templates
DROP POLICY IF EXISTS "Super admin can manage all templates" ON public.treatment_templates;
CREATE POLICY "Super admin can manage all templates"
ON public.treatment_templates FOR ALL
USING (is_super_admin());

-- 6. Exercise Library
DROP POLICY IF EXISTS "Super admin can manage all exercises" ON public.exercise_library;
CREATE POLICY "Super admin can manage all exercises"
ON public.exercise_library FOR ALL
USING (is_super_admin());

-- 7. Patient Prescriptions & Plans
DROP POLICY IF EXISTS "Super admin can manage all prescriptions" ON public.patient_exercise_prescriptions;
CREATE POLICY "Super admin can manage all prescriptions"
ON public.patient_exercise_prescriptions FOR ALL
USING (is_super_admin());

DROP POLICY IF EXISTS "Super admin can manage all treatment plans" ON public.patient_treatment_plans;
CREATE POLICY "Super admin can manage all treatment plans"
ON public.patient_treatment_plans FOR ALL
USING (is_super_admin());

-- 8. Clinical History & Assessments
DROP POLICY IF EXISTS "Super admin can manage medical history" ON public.patient_medical_history;
CREATE POLICY "Super admin can manage medical history"
ON public.patient_medical_history FOR ALL
USING (is_super_admin());

DROP POLICY IF EXISTS "Super admin can manage assessments" ON public.initial_assessments;
CREATE POLICY "Super admin can manage assessments"
ON public.initial_assessments FOR ALL
USING (is_super_admin());

-- 9. Documents
DROP POLICY IF EXISTS "Super admin can manage documents" ON public.patient_documents;
CREATE POLICY "Super admin can manage documents"
ON public.patient_documents FOR ALL
USING (is_super_admin());
