-- =====================================================
-- Script de Diagnóstico: Verificar Datos de Clínicas
-- =====================================================
-- Este script ayuda a identificar problemas de aislamiento de datos
-- entre clínicas
-- =====================================================

-- 1. Ver todas las clínicas registradas
SELECT
  id,
  name,
  slug,
  email,
  subscription_status,
  created_at,
  is_active
FROM public.clinics
ORDER BY created_at DESC;

-- 2. Ver todos los usuarios y sus clínicas asignadas
SELECT
  up.id,
  u.email,
  up.full_name,
  up.role,
  up.clinic_id,
  c.name as clinic_name,
  c.slug as clinic_slug,
  up.is_active
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.id
LEFT JOIN public.clinics c ON c.id = up.clinic_id
ORDER BY up.created_at DESC;

-- 3. Contar pacientes por clínica
SELECT
  c.id as clinic_id,
  c.name as clinic_name,
  c.slug,
  COUNT(p.id) as total_patients
FROM public.clinics c
LEFT JOIN public.patients p ON p.clinic_id = c.id
GROUP BY c.id, c.name, c.slug
ORDER BY total_patients DESC;

-- 4. Contar citas por clínica
SELECT
  c.id as clinic_id,
  c.name as clinic_name,
  COUNT(a.id) as total_appointments
FROM public.clinics c
LEFT JOIN public.appointments a ON a.clinic_id = c.id
GROUP BY c.id, c.name
ORDER BY total_appointments DESC;

-- 5. Contar pagos por clínica
SELECT
  c.id as clinic_id,
  c.name as clinic_name,
  COUNT(pay.id) as total_payments,
  COALESCE(SUM(pay.amount), 0) as total_amount
FROM public.clinics c
LEFT JOIN public.payments pay ON pay.clinic_id = c.id
GROUP BY c.id, c.name
ORDER BY total_amount DESC;

-- 6. Verificar pacientes sin clinic_id (datos huérfanos)
SELECT
  COUNT(*) as patients_without_clinic,
  'PROBLEMA: Pacientes sin clínica asignada' as issue
FROM public.patients
WHERE clinic_id IS NULL;

-- 7. Verificar citas sin clinic_id
SELECT
  COUNT(*) as appointments_without_clinic,
  'PROBLEMA: Citas sin clínica asignada' as issue
FROM public.appointments
WHERE clinic_id IS NULL;

-- 8. Verificar usuarios sin clinic_id
SELECT
  COUNT(*) as users_without_clinic,
  'PROBLEMA: Usuarios sin clínica asignada' as issue
FROM public.user_profiles
WHERE clinic_id IS NULL;

-- 9. Verificar inconsistencias: pacientes de una clínica con citas de otra
SELECT
  p.id as patient_id,
  p.first_name || ' ' || p.last_name as patient_name,
  p.clinic_id as patient_clinic_id,
  c1.name as patient_clinic_name,
  a.clinic_id as appointment_clinic_id,
  c2.name as appointment_clinic_name,
  'PROBLEMA: Paciente y cita en clínicas diferentes' as issue
FROM public.patients p
JOIN public.appointments a ON a.patient_id = p.id
LEFT JOIN public.clinics c1 ON c1.id = p.clinic_id
LEFT JOIN public.clinics c2 ON c2.id = a.clinic_id
WHERE p.clinic_id != a.clinic_id;

-- 10. Ver el estado actual de RLS en las tablas principales
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('clinics', 'user_profiles', 'patients', 'appointments', 'sessions', 'payments')
ORDER BY tablename;

-- 11. Ver políticas RLS activas en la tabla patients
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation,
  qual as using_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'patients'
ORDER BY policyname;
