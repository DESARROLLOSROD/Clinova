-- =====================================================
-- Script: Identificar y Corregir Datos Huérfanos
-- =====================================================
-- Este script identifica datos sin clinic_id y te ayuda a asignarlos
-- Ejecuta PRIMERO este script antes de la migración principal
-- =====================================================

-- PASO 1: Diagnóstico - Ver el estado actual
SELECT '=== DIAGNÓSTICO DE DATOS HUÉRFANOS ===' as info;

SELECT
  'Total de clínicas' as metrica,
  COUNT(*)::text as valor
FROM public.clinics

UNION ALL

SELECT
  'Pacientes sin clinic_id',
  COUNT(*)::text
FROM public.patients
WHERE clinic_id IS NULL

UNION ALL

SELECT
  'Citas sin clinic_id',
  COUNT(*)::text
FROM public.appointments
WHERE clinic_id IS NULL

UNION ALL

SELECT
  'Pagos sin clinic_id',
  COUNT(*)::text
FROM public.payments
WHERE clinic_id IS NULL

UNION ALL

SELECT
  'Usuarios sin clinic_id',
  COUNT(*)::text
FROM public.user_profiles
WHERE clinic_id IS NULL;

-- PASO 2: Ver las clínicas disponibles
SELECT '=== CLÍNICAS DISPONIBLES ===' as info;

SELECT
  id,
  name,
  slug,
  email,
  created_at
FROM public.clinics
ORDER BY created_at;

-- PASO 3: Ver pacientes huérfanos (si los hay)
SELECT '=== PACIENTES SIN CLINIC_ID ===' as info;

SELECT
  id,
  first_name,
  last_name,
  email,
  created_at
FROM public.patients
WHERE clinic_id IS NULL
ORDER BY created_at
LIMIT 20;

-- PASO 4: Ver usuarios huérfanos (si los hay)
SELECT '=== USUARIOS SIN CLINIC_ID ===' as info;

SELECT
  up.id,
  u.email,
  up.full_name,
  up.role,
  up.created_at
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.id
WHERE up.clinic_id IS NULL
ORDER BY up.created_at;

-- =====================================================
-- OPCIÓN A: SOLUCIÓN AUTOMÁTICA (solo si hay 1 clínica)
-- =====================================================
-- Descomenta este bloque SOLO si tienes una única clínica
-- y quieres asignar todos los datos huérfanos a ella

/*
DO $$
DECLARE
  clinic_id_to_assign uuid;
  clinic_count integer;
BEGIN
  SELECT COUNT(*) INTO clinic_count FROM public.clinics;

  IF clinic_count != 1 THEN
    RAISE EXCEPTION 'Este script solo funciona con 1 clínica. Tienes %', clinic_count;
  END IF;

  SELECT id INTO clinic_id_to_assign FROM public.clinics LIMIT 1;

  RAISE NOTICE 'Asignando todos los datos a clinic_id: %', clinic_id_to_assign;

  -- Actualizar pacientes
  UPDATE public.patients
  SET clinic_id = clinic_id_to_assign
  WHERE clinic_id IS NULL;

  -- Actualizar citas
  UPDATE public.appointments
  SET clinic_id = clinic_id_to_assign
  WHERE clinic_id IS NULL;

  -- Actualizar pagos
  UPDATE public.payments
  SET clinic_id = clinic_id_to_assign
  WHERE clinic_id IS NULL;

  -- Actualizar usuarios
  UPDATE public.user_profiles
  SET clinic_id = clinic_id_to_assign
  WHERE clinic_id IS NULL;

  RAISE NOTICE 'Actualización completada';
END $$;
*/

-- =====================================================
-- OPCIÓN B: SOLUCIÓN MANUAL (múltiples clínicas)
-- =====================================================
-- Si tienes múltiples clínicas, ejecuta estos UPDATEs manualmente
-- reemplazando '<CLINIC_ID_AQUI>' con el ID correcto de cada clínica

-- Ejemplo: Asignar pacientes específicos a una clínica
/*
UPDATE public.patients
SET clinic_id = '<CLINIC_ID_AQUI>'
WHERE clinic_id IS NULL
AND email LIKE '%@tudominio.com';  -- Filtra por algún criterio

-- Asignar usuarios específicos
UPDATE public.user_profiles
SET clinic_id = '<CLINIC_ID_AQUI>'
WHERE clinic_id IS NULL
AND id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@tudominio.com'
);

-- Asignar citas basándose en el paciente
UPDATE public.appointments a
SET clinic_id = p.clinic_id
FROM public.patients p
WHERE a.patient_id = p.id
AND a.clinic_id IS NULL
AND p.clinic_id IS NOT NULL;

-- Asignar pagos basándose en el paciente
UPDATE public.payments pay
SET clinic_id = p.clinic_id
FROM public.patients p
WHERE pay.patient_id = p.id
AND pay.clinic_id IS NULL
AND p.clinic_id IS NOT NULL;
*/

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
-- Ejecuta esto después de corregir los datos

SELECT '=== VERIFICACIÓN FINAL ===' as info;

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ No hay pacientes huérfanos'
    ELSE '❌ Aún hay ' || COUNT(*)::text || ' pacientes sin clinic_id'
  END as resultado
FROM public.patients
WHERE clinic_id IS NULL

UNION ALL

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ No hay citas huérfanas'
    ELSE '❌ Aún hay ' || COUNT(*)::text || ' citas sin clinic_id'
  END
FROM public.appointments
WHERE clinic_id IS NULL

UNION ALL

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ No hay pagos huérfanos'
    ELSE '❌ Aún hay ' || COUNT(*)::text || ' pagos sin clinic_id'
  END
FROM public.payments
WHERE clinic_id IS NULL

UNION ALL

SELECT
  CASE
    WHEN COUNT(*) = 0 THEN '✅ No hay usuarios huérfanos'
    ELSE '❌ Aún hay ' || COUNT(*)::text || ' usuarios sin clinic_id'
  END
FROM public.user_profiles
WHERE clinic_id IS NULL;

-- Si todos muestran ✅, puedes ejecutar la migración principal
-- supabase/migrations/20260113_enforce_clinic_data_isolation.sql
