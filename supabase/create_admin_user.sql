-- ============================================================================
-- CREAR PRIMER USUARIO ADMINISTRADOR
-- ============================================================================
-- Este script crea un usuario administrador en el sistema
--
-- IMPORTANTE:
-- 1. Primero debes crear el usuario en Supabase Dashboard → Authentication
-- 2. Luego ejecuta este script reemplazando el email
-- 3. O usa la función create_admin_user() con el user_id
-- ============================================================================

-- ============================================================================
-- OPCIÓN 1: Asignar rol admin a usuario existente por EMAIL
-- ============================================================================
-- Reemplaza 'tu-email@example.com' con el email del usuario que creaste

DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
    v_user_email TEXT := 'admin@clinova.com'; -- ⚠️ CAMBIAR ESTE EMAIL
BEGIN
    -- Buscar el user_id del email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario con email % no encontrado. Crear primero en Authentication.', v_user_email;
    END IF;

    -- Obtener role_id del rol admin
    SELECT id INTO v_role_id
    FROM public.roles
    WHERE name = 'admin';

    -- Actualizar metadata del usuario
    UPDATE auth.users
    SET
        raw_user_meta_data = jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{role}',
            '"admin"'
        ),
        raw_app_meta_data = jsonb_set(
            COALESCE(raw_app_meta_data, '{}'::jsonb),
            '{role}',
            '"admin"'
        )
    WHERE id = v_user_id;

    -- Asignar rol en la tabla user_roles
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    RAISE NOTICE '✅ Usuario admin creado exitosamente!';
    RAISE NOTICE '📧 Email: %', v_user_email;
    RAISE NOTICE '🆔 User ID: %', v_user_id;
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Ahora puedes iniciar sesión con este usuario';
END $$;

-- ============================================================================
-- OPCIÓN 2: Función reutilizable para crear admin por USER_ID
-- ============================================================================

CREATE OR REPLACE FUNCTION public.make_user_admin(
    p_user_id UUID,
    p_first_name TEXT DEFAULT 'Admin',
    p_last_name TEXT DEFAULT 'Principal'
)
RETURNS JSON AS $$
DECLARE
    v_role_id UUID;
    v_result JSON;
BEGIN
    -- Verificar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuario no encontrado'
        );
    END IF;

    -- Obtener role_id del rol admin
    SELECT id INTO v_role_id
    FROM public.roles
    WHERE name = 'admin';

    -- Actualizar metadata del usuario
    UPDATE auth.users
    SET
        raw_user_meta_data = jsonb_set(
            jsonb_set(
                COALESCE(raw_user_meta_data, '{}'::jsonb),
                '{role}',
                '"admin"'
            ),
            '{first_name}',
            to_jsonb(p_first_name)
        ),
        raw_user_meta_data = jsonb_set(
            raw_user_meta_data,
            '{last_name}',
            to_jsonb(p_last_name)
        ),
        raw_app_meta_data = jsonb_set(
            COALESCE(raw_app_meta_data, '{}'::jsonb),
            '{role}',
            '"admin"'
        )
    WHERE id = p_user_id;

    -- Asignar rol en la tabla user_roles
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (p_user_id, v_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    v_result := json_build_object(
        'success', true,
        'user_id', p_user_id,
        'role', 'admin',
        'message', 'Usuario convertido a administrador exitosamente'
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejemplo de uso de la función:
-- SELECT public.make_user_admin('user-uuid-aqui', 'Carlos', 'Rodriguez');

-- ============================================================================
-- OPCIÓN 3: Función para crear admin por EMAIL
-- ============================================================================

CREATE OR REPLACE FUNCTION public.make_user_admin_by_email(
    p_email TEXT,
    p_first_name TEXT DEFAULT 'Admin',
    p_last_name TEXT DEFAULT 'Principal'
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
    v_result JSON;
BEGIN
    -- Buscar el user_id del email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email;

    IF v_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Usuario con email ' || p_email || ' no encontrado'
        );
    END IF;

    -- Obtener role_id del rol admin
    SELECT id INTO v_role_id
    FROM public.roles
    WHERE name = 'admin';

    -- Actualizar metadata del usuario
    UPDATE auth.users
    SET
        raw_user_meta_data = jsonb_set(
            jsonb_set(
                jsonb_set(
                    COALESCE(raw_user_meta_data, '{}'::jsonb),
                    '{role}',
                    '"admin"'
                ),
                '{first_name}',
                to_jsonb(p_first_name)
            ),
            '{last_name}',
            to_jsonb(p_last_name)
        ),
        raw_app_meta_data = jsonb_set(
            COALESCE(raw_app_meta_data, '{}'::jsonb),
            '{role}',
            '"admin"'
        )
    WHERE id = v_user_id;

    -- Asignar rol en la tabla user_roles
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    v_result := json_build_object(
        'success', true,
        'user_id', v_user_id,
        'email', p_email,
        'role', 'admin',
        'message', 'Usuario convertido a administrador exitosamente'
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejemplo de uso:
-- SELECT public.make_user_admin_by_email('admin@clinova.com', 'Carlos', 'Admin');

-- ============================================================================
-- VERIFICAR USUARIO ADMIN
-- ============================================================================

-- Query para verificar que el admin fue creado correctamente
SELECT
    u.id,
    u.email,
    u.raw_user_meta_data->>'first_name' as first_name,
    u.raw_user_meta_data->>'last_name' as last_name,
    u.raw_user_meta_data->>'role' as metadata_role,
    u.raw_app_meta_data->>'role' as app_metadata_role,
    r.name as assigned_role,
    r.display_name as role_display_name
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.roles r ON r.id = ur.role_id
WHERE u.email = 'admin@clinova.com' -- ⚠️ CAMBIAR ESTE EMAIL
ORDER BY u.created_at DESC;

-- ============================================================================
-- INFORMACIÓN ADICIONAL
-- ============================================================================

-- Ver todos los usuarios y sus roles
SELECT
    u.email,
    r.display_name as rol,
    u.created_at,
    u.last_sign_in_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.roles r ON r.id = ur.role_id
ORDER BY u.created_at DESC;

-- Ver permisos de un usuario específico
SELECT
    p.name as permiso,
    p.category as categoria,
    p.description as descripcion
FROM public.get_user_permissions('user-id-aqui') p
ORDER BY p.permission_category, p.permission_name;
