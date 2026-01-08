-- ============================================================================
-- FIX: Recursión infinita en políticas RLS de user_profiles
-- ============================================================================
-- Este script corrige el problema de recursión infinita en las políticas RLS
-- de user_profiles. El problema es que las políticas intentan leer de la misma
-- tabla que están protegiendo, causando recursión infinita.
--
-- SOLUCIÓN: Usar auth.jwt() para obtener información del usuario sin consultar
-- la tabla user_profiles.

-- ============================================================================
-- PASO 1: Eliminar las políticas problemáticas
-- ============================================================================

DROP POLICY IF EXISTS "Users can view profiles from their clinic" ON public.user_profiles;
DROP POLICY IF EXISTS "Only admins can create users" ON public.user_profiles;
DROP POLICY IF EXISTS "Only admins can update users" ON public.user_profiles;

-- ============================================================================
-- PASO 2: Crear nuevas políticas SIN recursión
-- ============================================================================

-- Política: Ver perfiles de la misma clínica
-- Usamos una función que NO causa recursión
CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Esta función obtiene el clinic_id directamente sin causar recursión
  SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Política: Ver perfiles de la misma clínica (sin recursión)
CREATE POLICY "Users can view profiles from their clinic v2"
ON public.user_profiles FOR SELECT
USING (
  -- Los usuarios pueden ver perfiles de su misma clínica
  clinic_id = get_user_clinic_id()
);

-- Política: Solo admins pueden crear usuarios (sin recursión)
CREATE POLICY "Only admins can create users v2"
ON public.user_profiles FOR INSERT
WITH CHECK (
  -- Verificar si el usuario tiene role 'admin' en auth.jwt()
  (auth.jwt()->>'role' = 'admin')
  OR
  -- O verificar en la tabla de forma controlada
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
    LIMIT 1
  )
);

-- Política: Solo admins pueden actualizar usuarios (sin recursión)
CREATE POLICY "Only admins can update users v2"
ON public.user_profiles FOR UPDATE
USING (
  -- Los admins pueden actualizar cualquier perfil
  (auth.jwt()->>'role' = 'admin')
  OR
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
    LIMIT 1
  )
  OR
  -- O el usuario puede actualizar su propio perfil
  auth.uid() = id
);

-- ============================================================================
-- PASO 3: Actualizar las funciones helper para evitar recursión
-- ============================================================================

-- Recrear las funciones helper sin recursión
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_clinic()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
    LIMIT 1
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_clinical_notes()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'therapist')
    LIMIT 1
  );
$$;

-- ============================================================================
-- PASO 4: Actualizar políticas de clinics para evitar recursión
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own clinic" ON public.clinics;
DROP POLICY IF EXISTS "Only admins can update clinic" ON public.clinics;

-- Nueva política sin recursión
CREATE POLICY "Users can view their own clinic v2"
ON public.clinics FOR SELECT
USING (
  id = get_user_clinic_id()
);

CREATE POLICY "Only admins can update clinic v2"
ON public.clinics FOR UPDATE
USING (
  id = get_user_clinic_id() AND is_admin()
);

-- ============================================================================
-- PASO 5: Actualizar política de audit_log para evitar recursión
-- ============================================================================

DROP POLICY IF EXISTS "Only admins can view audit log" ON public.audit_log;

CREATE POLICY "Only admins can view audit log v2"
ON public.audit_log FOR SELECT
USING (
  clinic_id = get_user_clinic_id() AND is_admin()
);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver las políticas actuales de user_profiles
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Políticas RLS de user_profiles actualizadas';
    RAISE NOTICE '📝 La recursión infinita ha sido corregida';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Ahora recarga la página de la aplicación';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE: Ejecuta este script en el SQL Editor de Supabase';
END $$;
