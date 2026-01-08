-- ============================================================================
-- FIX: Recursión infinita en políticas RLS de user_roles
-- ============================================================================
-- Este script corrige el problema de recursión infinita en las políticas RLS

-- Eliminar la política problemática
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

-- Crear una política más simple que NO cause recursión
-- En lugar de verificar en user_roles (que causa recursión),
-- verificamos el rol directamente desde auth.jwt() o user_metadata

CREATE POLICY "Admins can manage all user roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
    -- Verificar si el usuario tiene role 'admin' en su metadata
    (auth.jwt()->>'role' = 'admin')
    OR
    -- O si está viendo sus propios roles
    (auth.uid() = user_id)
)
WITH CHECK (
    -- Para INSERT/UPDATE, también verificar el rol
    (auth.jwt()->>'role' = 'admin')
);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver las políticas actuales de user_roles
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_roles'
ORDER BY policyname;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Políticas RLS actualizadas';
    RAISE NOTICE '📝 La recursión infinita ha sido corregida';
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Ahora recarga la página de la aplicación';
END $$;
