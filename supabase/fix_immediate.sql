-- =====================================================
-- Script de Corrección Inmediata
-- =====================================================
-- Este script identifica y corrige los datos huérfanos específicos
-- =====================================================

-- PASO 1: Ver todas las clínicas disponibles
SELECT '=== CLÍNICAS DISPONIBLES ===' as info;
SELECT id, name, slug, email, created_at
FROM public.clinics
ORDER BY created_at;

-- PASO 2: Ver el usuario huérfano
SELECT '=== USUARIO SIN CLINIC_ID ===' as info;
SELECT
  up.id,
  u.email,
  up.full_name,
  up.role,
  up.created_at
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.id
WHERE up.clinic_id IS NULL;

-- PASO 3: Ver el paciente huérfano
SELECT '=== PACIENTE SIN CLINIC_ID ===' as info;
SELECT
  id,
  first_name,
  last_name,
  email,
  created_at
FROM public.patients
WHERE clinic_id IS NULL;

-- PASO 4: Ver la cita huérfana
SELECT '=== CITA SIN CLINIC_ID ===' as info;
SELECT
  a.id,
  a.start_time,
  a.patient_id,
  p.first_name || ' ' || p.last_name as patient_name,
  a.created_at
FROM public.appointments a
LEFT JOIN public.patients p ON p.id = a.patient_id
WHERE a.clinic_id IS NULL;

-- =====================================================
-- CORRECCIÓN: Selecciona UNA de estas opciones
-- =====================================================

-- OPCIÓN 1: Si todos los datos deben ir a la PRIMERA clínica
-- (descomenta estas líneas si es correcto)
/*
DO $$
DECLARE
  target_clinic_id uuid;
BEGIN
  -- Obtener el ID de la primera clínica (por fecha de creación)
  SELECT id INTO target_clinic_id
  FROM public.clinics
  ORDER BY created_at
  LIMIT 1;

  RAISE NOTICE 'Asignando datos a clínica: %', target_clinic_id;

  -- Actualizar usuario huérfano
  UPDATE public.user_profiles
  SET clinic_id = target_clinic_id
  WHERE clinic_id IS NULL;

  -- Actualizar paciente huérfano
  UPDATE public.patients
  SET clinic_id = target_clinic_id
  WHERE clinic_id IS NULL;

  -- Actualizar cita huérfana
  UPDATE public.appointments
  SET clinic_id = target_clinic_id
  WHERE clinic_id IS NULL;

  RAISE NOTICE 'Datos actualizados correctamente';
END $$;
*/

-- OPCIÓN 2: Si todos los datos deben ir a una clínica ESPECÍFICA
-- (reemplaza <CLINIC_ID_AQUI> con el ID correcto de tu clínica)
/*
DO $$
DECLARE
  target_clinic_id uuid := '<CLINIC_ID_AQUI>';  -- Reemplaza esto
BEGIN
  RAISE NOTICE 'Asignando datos a clínica: %', target_clinic_id;

  -- Actualizar usuario huérfano
  UPDATE public.user_profiles
  SET clinic_id = target_clinic_id
  WHERE clinic_id IS NULL;

  -- Actualizar paciente huérfano
  UPDATE public.patients
  SET clinic_id = target_clinic_id
  WHERE clinic_id IS NULL;

  -- Actualizar cita huérfana
  UPDATE public.appointments
  SET clinic_id = target_clinic_id
  WHERE clinic_id IS NULL;

  RAISE NOTICE 'Datos actualizados correctamente';
END $$;
*/

-- OPCIÓN 3: Asignación manual selectiva
-- (para casos donde cada dato va a una clínica diferente)
/*
-- Asignar usuario específico
UPDATE public.user_profiles
SET clinic_id = '<CLINIC_ID_USUARIO>'
WHERE id = '<USER_ID>';

-- Asignar paciente específico
UPDATE public.patients
SET clinic_id = '<CLINIC_ID_PACIENTE>'
WHERE id = '<PATIENT_ID>';

-- Asignar cita específica
UPDATE public.appointments
SET clinic_id = '<CLINIC_ID_CITA>'
WHERE id = '<APPOINTMENT_ID>';
*/

-- =====================================================
-- VERIFICACIÓN: Ejecuta esto después de la corrección
-- =====================================================

SELECT '=== VERIFICACIÓN FINAL ===' as info;

SELECT
  'Pacientes sin clinic_id' as item,
  COUNT(*) as cantidad,
  CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ PENDIENTE' END as status
FROM public.patients
WHERE clinic_id IS NULL

UNION ALL

SELECT
  'Citas sin clinic_id',
  COUNT(*),
  CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ PENDIENTE' END
FROM public.appointments
WHERE clinic_id IS NULL

UNION ALL

SELECT
  'Usuarios sin clinic_id',
  COUNT(*),
  CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ PENDIENTE' END
FROM public.user_profiles
WHERE clinic_id IS NULL;

-- Si todos muestran ✅ OK, puedes ejecutar la migración principal
