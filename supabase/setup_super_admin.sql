-- =====================================================
-- Setup: Configurar Super Admin y Limpiar Datos Huérfanos
-- =====================================================
-- Este script configura correctamente el Super Admin y asigna
-- los datos huérfanos a sus clínicas correctas
-- =====================================================

BEGIN;

-- =====================================================
-- PASO 1: Crear Clínica Administrativa (si no existe)
-- =====================================================

-- Insertar clínica administrativa para el super admin
INSERT INTO public.clinics (
  name,
  slug,
  email,
  subscription_tier,
  subscription_status,
  max_users,
  max_patients
)
VALUES (
  'Clinova Administración',
  'clinova-admin',
  'admin@clinova.com',
  'enterprise',
  'active',
  999,
  999999
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- PASO 2: Asignar Super Admin a Clínica Administrativa
-- =====================================================

UPDATE public.user_profiles
SET clinic_id = (SELECT id FROM public.clinics WHERE slug = 'clinova-admin')
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@clinova.com'
);

-- =====================================================
-- PASO 3: Ver Estado Actual
-- =====================================================

-- Ver todas las clínicas
SELECT '=== CLÍNICAS REGISTRADAS ===' as seccion;
SELECT
  id,
  name,
  slug,
  email,
  subscription_tier,
  created_at
FROM public.clinics
ORDER BY created_at;

-- Ver todos los usuarios y sus clínicas
SELECT '=== USUARIOS Y SUS CLÍNICAS ===' as seccion;
SELECT
  up.id,
  u.email,
  up.full_name,
  up.role,
  c.name as clinic_name,
  c.slug as clinic_slug
FROM public.user_profiles up
JOIN auth.users u ON u.id = up.id
LEFT JOIN public.clinics c ON c.id = up.clinic_id
ORDER BY up.created_at;

-- Ver datos huérfanos
SELECT '=== DATOS HUÉRFANOS ===' as seccion;

SELECT
  'Pacientes sin clinic_id' as tipo,
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
WHERE clinic_id IS NULL;

-- =====================================================
-- PASO 4: Asignar Datos Huérfanos a la Clínica Correcta
-- =====================================================
-- IMPORTANTE: Descomenta UNA de estas opciones

-- OPCIÓN A: Asignar todos los datos a la PRIMERA clínica de cliente
-- (la que NO es clinova-admin)
/*
DO $$
DECLARE
  client_clinic_id uuid;
BEGIN
  -- Obtener la primera clínica que NO sea la administrativa
  SELECT id INTO client_clinic_id
  FROM public.clinics
  WHERE slug != 'clinova-admin'
  ORDER BY created_at
  LIMIT 1;

  RAISE NOTICE 'Asignando datos huérfanos a clínica: %', client_clinic_id;

  -- Asignar pacientes
  UPDATE public.patients
  SET clinic_id = client_clinic_id
  WHERE clinic_id IS NULL;

  -- Asignar citas
  UPDATE public.appointments
  SET clinic_id = client_clinic_id
  WHERE clinic_id IS NULL;

  -- Asignar usuarios (excepto super_admin)
  UPDATE public.user_profiles
  SET clinic_id = client_clinic_id
  WHERE clinic_id IS NULL
  AND role != 'super_admin';

  RAISE NOTICE '✅ Datos asignados correctamente';
END $$;
*/

COMMIT;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

SELECT '=== VERIFICACIÓN FINAL ===' as seccion;

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
  'Usuarios sin clinic_id (excepto super_admin)',
  COUNT(*),
  CASE WHEN COUNT(*) = 0 THEN '✅ OK' ELSE '❌ PENDIENTE' END
FROM public.user_profiles
WHERE clinic_id IS NULL
AND role != 'super_admin';

-- Mostrar resumen de clínicas y usuarios
SELECT '=== RESUMEN POR CLÍNICA ===' as seccion;

SELECT
  c.name as clinica,
  c.slug,
  COUNT(DISTINCT up.id) as usuarios,
  COUNT(DISTINCT p.id) as pacientes,
  COUNT(DISTINCT a.id) as citas
FROM public.clinics c
LEFT JOIN public.user_profiles up ON up.clinic_id = c.id
LEFT JOIN public.patients p ON p.clinic_id = c.id
LEFT JOIN public.appointments a ON a.clinic_id = c.id
GROUP BY c.id, c.name, c.slug
ORDER BY c.created_at;
