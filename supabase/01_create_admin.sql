-- ============================================================================
-- CREAR USUARIO ADMINISTRADOR
-- ============================================================================
-- Este script crea un usuario administrador para Clinova
--
-- PASOS:
-- 1. Primero crea el usuario en Supabase Dashboard → Authentication → Users → Invite user
-- 2. Luego ejecuta este script reemplazando el email en la línea 21
-- ============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_clinic_id UUID;
    v_user_email TEXT := 'admin@clinova.com'; -- ⚠️ CAMBIAR ESTE EMAIL
    v_full_name TEXT := 'Administrador Principal'; -- ⚠️ CAMBIAR NOMBRE
    v_clinic_name TEXT := 'Clínica Principal'; -- ⚠️ CAMBIAR NOMBRE DE CLÍNICA
BEGIN
    -- Buscar el user_id del email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario con email % no encontrado. Primero créalo en Authentication → Users → Invite user', v_user_email;
    END IF;

    -- Obtener o crear la clínica principal
    SELECT id INTO v_clinic_id
    FROM public.clinics
    WHERE email = v_user_email
    LIMIT 1;

    IF v_clinic_id IS NULL THEN
        -- Crear clínica si no existe
        INSERT INTO public.clinics (
            name,
            slug,
            email,
            subscription_tier,
            subscription_status,
            is_active
        )
        VALUES (
            v_clinic_name,
            lower(regexp_replace(v_clinic_name, '[^a-zA-Z0-9]', '-', 'g')),
            v_user_email,
            'professional',
            'active',
            true
        )
        RETURNING id INTO v_clinic_id;

        RAISE NOTICE '✅ Clínica creada: %', v_clinic_name;
    END IF;

    -- Crear o actualizar el perfil del usuario
    INSERT INTO public.user_profiles (
        id,
        role,
        clinic_id,
        full_name,
        is_active
    )
    VALUES (
        v_user_id,
        'admin',
        v_clinic_id,
        v_full_name,
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET
        role = 'admin',
        clinic_id = v_clinic_id,
        full_name = v_full_name,
        is_active = true;

    -- Actualizar metadata del usuario en auth.users
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

    RAISE NOTICE '';
    RAISE NOTICE '✅ ¡Usuario administrador creado exitosamente!';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Email: %', v_user_email;
    RAISE NOTICE '👤 Nombre: %', v_full_name;
    RAISE NOTICE '🏥 Clínica: %', v_clinic_name;
    RAISE NOTICE '🆔 User ID: %', v_user_id;
    RAISE NOTICE '🏥 Clinic ID: %', v_clinic_id;
    RAISE NOTICE '🎯 Rol: admin';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Ahora puedes iniciar sesión con este usuario';
END $$;

-- ============================================================================
-- VERIFICAR USUARIO CREADO
-- ============================================================================

SELECT
    u.id,
    u.email,
    up.full_name,
    up.role,
    c.name as clinic_name,
    up.is_active,
    u.created_at
FROM auth.users u
LEFT JOIN public.user_profiles up ON up.id = u.id
LEFT JOIN public.clinics c ON c.id = up.clinic_id
WHERE u.email = 'admin@clinova.com' -- ⚠️ CAMBIAR EMAIL PARA VERIFICAR
ORDER BY u.created_at DESC;
