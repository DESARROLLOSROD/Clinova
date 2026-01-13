-- =====================================================
-- Script Rápido: Verificar y Corregir Aislamiento
-- =====================================================
-- Este script se puede ejecutar directamente en Supabase SQL Editor
-- =====================================================

-- PASO 1: Ver el estado actual
SELECT '=== CLÍNICAS REGISTRADAS ===' as info;
SELECT id, name, slug, email FROM public.clinics;

SELECT '=== USUARIOS Y SUS CLÍNICAS ===' as info;
SELECT
  up.id,
  u.email,
  up.full_name,
  up.role,
  c.name as clinic_name
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.id
LEFT JOIN public.clinics c ON c.id = up.clinic_id
ORDER BY u.email;

SELECT '=== CONTEO DE DATOS POR CLÍNICA ===' as info;
SELECT
  c.name as clinic_name,
  COUNT(DISTINCT p.id) as pacientes,
  COUNT(DISTINCT a.id) as citas,
  COUNT(DISTINCT s.id) as sesiones,
  COUNT(DISTINCT pay.id) as pagos
FROM public.clinics c
LEFT JOIN public.patients p ON p.clinic_id = c.id
LEFT JOIN public.appointments a ON a.clinic_id = c.id
LEFT JOIN public.sessions s ON s.appointment_id = a.id
LEFT JOIN public.payments pay ON pay.clinic_id = c.id
GROUP BY c.id, c.name
ORDER BY pacientes DESC;

-- PASO 2: Verificar si hay datos huérfanos
SELECT '=== VERIFICANDO DATOS HUÉRFANOS ===' as info;

SELECT
  'Pacientes sin clinic_id' as problema,
  COUNT(*) as cantidad
FROM public.patients
WHERE clinic_id IS NULL
UNION ALL
SELECT
  'Citas sin clinic_id',
  COUNT(*)
FROM public.appointments
WHERE clinic_id IS NULL
UNION ALL
SELECT
  'Usuarios sin clinic_id',
  COUNT(*)
FROM public.user_profiles
WHERE clinic_id IS NULL
UNION ALL
SELECT
  'Pagos sin clinic_id',
  COUNT(*)
FROM public.payments
WHERE clinic_id IS NULL;

-- PASO 3: Si solo hay UNA clínica, asignar datos huérfanos a esa clínica
-- ⚠️ Solo descomentar si estás seguro y hay una sola clínica

/*
DO $$
DECLARE
  default_clinic_id uuid;
  clinic_count integer;
BEGIN
  SELECT COUNT(*) INTO clinic_count FROM public.clinics;

  IF clinic_count = 1 THEN
    SELECT id INTO default_clinic_id FROM public.clinics LIMIT 1;

    -- Asignar pacientes huérfanos
    UPDATE public.patients
    SET clinic_id = default_clinic_id
    WHERE clinic_id IS NULL;

    -- Asignar citas huérfanas
    UPDATE public.appointments
    SET clinic_id = default_clinic_id
    WHERE clinic_id IS NULL;

    -- Asignar pagos huérfanos
    UPDATE public.payments
    SET clinic_id = default_clinic_id
    WHERE clinic_id IS NULL;

    -- Asignar usuarios huérfanos
    UPDATE public.user_profiles
    SET clinic_id = default_clinic_id
    WHERE clinic_id IS NULL;

    RAISE NOTICE 'Datos huérfanos asignados a clínica: %', default_clinic_id;
  ELSE
    RAISE NOTICE 'Hay % clínicas. Asigna clinic_id manualmente.', clinic_count;
  END IF;
END $$;
*/

-- PASO 4: Verificar estado de RLS
SELECT '=== ESTADO DE ROW LEVEL SECURITY ===' as info;
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✅ Habilitado' ELSE '❌ Deshabilitado' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'clinics', 'user_profiles', 'patients', 'appointments',
  'sessions', 'payments', 'patient_documents'
)
ORDER BY tablename;

-- PASO 5: Ver políticas RLS en tabla patients
SELECT '=== POLÍTICAS RLS EN TABLA PATIENTS ===' as info;
SELECT
  policyname,
  cmd as operation,
  CASE
    WHEN cmd = 'SELECT' THEN 'Ver datos'
    WHEN cmd = 'INSERT' THEN 'Crear datos'
    WHEN cmd = 'UPDATE' THEN 'Actualizar datos'
    WHEN cmd = 'DELETE' THEN 'Eliminar datos'
    WHEN cmd = '*' THEN 'Todas las operaciones'
  END as descripcion
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'patients'
ORDER BY cmd, policyname;

-- PASO 6: Verificar inconsistencias (paciente en una clínica, cita en otra)
SELECT '=== VERIFICANDO INCONSISTENCIAS ENTRE TABLAS ===' as info;
SELECT
  p.id as patient_id,
  p.first_name || ' ' || p.last_name as patient_name,
  c1.name as patient_clinic,
  c2.name as appointment_clinic,
  'PROBLEMA: Datos en clínicas diferentes' as issue
FROM public.patients p
JOIN public.appointments a ON a.patient_id = p.id
LEFT JOIN public.clinics c1 ON c1.id = p.clinic_id
LEFT JOIN public.clinics c2 ON c2.id = a.clinic_id
WHERE p.clinic_id != a.clinic_id
LIMIT 10;

SELECT '=== FIN DEL DIAGNÓSTICO ===' as info;
