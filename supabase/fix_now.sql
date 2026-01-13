-- =====================================================
-- PASO 1: VER CLÍNICAS Y DATOS HUÉRFANOS
-- =====================================================
-- Ejecuta esta primera parte para identificar los datos

-- Ver todas las clínicas
SELECT '=== MIS CLÍNICAS ===' as seccion;
SELECT
  id,
  name,
  slug,
  email,
  created_at
FROM public.clinics
ORDER BY created_at;

-- Ver usuario sin clínica
SELECT '=== USUARIO HUÉRFANO ===' as seccion;
SELECT
  up.id as user_id,
  u.email,
  up.full_name,
  up.role
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.id
WHERE up.clinic_id IS NULL;

-- Ver paciente sin clínica
SELECT '=== PACIENTE HUÉRFANO ===' as seccion;
SELECT
  id as patient_id,
  first_name,
  last_name,
  email
FROM public.patients
WHERE clinic_id IS NULL;

-- Ver citas sin clínica
SELECT '=== CITAS HUÉRFANAS ===' as seccion;
SELECT
  a.id as appointment_id,
  a.start_time,
  a.patient_id,
  p.first_name || ' ' || p.last_name as patient_name
FROM public.appointments a
LEFT JOIN public.patients p ON p.id = a.patient_id
WHERE a.clinic_id IS NULL;

-- =====================================================
-- PASO 2: CORREGIR (ejecuta después de ver los datos)
-- =====================================================
-- Descomenta UNA de estas opciones según lo que viste arriba:

-- OPCIÓN A: Todos a la PRIMERA clínica (la más antigua)
-- Descomenta si todos los datos deben ir a tu clínica principal
/*
DO $$
DECLARE
  mi_clinic_id uuid;
BEGIN
  -- Obtener la primera clínica creada
  SELECT id INTO mi_clinic_id
  FROM public.clinics
  ORDER BY created_at
  LIMIT 1;

  RAISE NOTICE 'Asignando a clínica: %', mi_clinic_id;

  UPDATE public.user_profiles SET clinic_id = mi_clinic_id WHERE clinic_id IS NULL;
  UPDATE public.patients SET clinic_id = mi_clinic_id WHERE clinic_id IS NULL;
  UPDATE public.appointments SET clinic_id = mi_clinic_id WHERE clinic_id IS NULL;

  RAISE NOTICE '✅ Actualización completada';
END $$;
*/

-- OPCIÓN B: Todos a una clínica ESPECÍFICA
-- 1. Copia el ID de tu clínica del PASO 1
-- 2. Pégalo abajo donde dice <PEGA_TU_CLINIC_ID_AQUI>
-- 3. Descomenta este bloque
/*
DO $$
DECLARE
  mi_clinic_id uuid := '<PEGA_TU_CLINIC_ID_AQUI>';
BEGIN
  RAISE NOTICE 'Asignando a clínica: %', mi_clinic_id;

  UPDATE public.user_profiles SET clinic_id = mi_clinic_id WHERE clinic_id IS NULL;
  UPDATE public.patients SET clinic_id = mi_clinic_id WHERE clinic_id IS NULL;
  UPDATE public.appointments SET clinic_id = mi_clinic_id WHERE clinic_id IS NULL;

  RAISE NOTICE '✅ Actualización completada';
END $$;
*/

-- =====================================================
-- PASO 3: VERIFICAR
-- =====================================================
-- Ejecuta esto DESPUÉS de la corrección

SELECT '=== VERIFICACIÓN ===' as seccion;

SELECT
  'Pacientes sin clinic_id' as item,
  COUNT(*) as cantidad,
  CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ AÚN FALTAN' END as status
FROM public.patients
WHERE clinic_id IS NULL

UNION ALL

SELECT
  'Citas sin clinic_id',
  COUNT(*),
  CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ AÚN FALTAN' END
FROM public.appointments
WHERE clinic_id IS NULL

UNION ALL

SELECT
  'Usuarios sin clinic_id',
  COUNT(*),
  CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ AÚN FALTAN' END
FROM public.user_profiles
WHERE clinic_id IS NULL;

-- Si todos muestran ✅ OK, ejecuta la migración principal:
-- 20260113_enforce_clinic_data_isolation.sql
