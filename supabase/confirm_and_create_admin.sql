-- ============================================================================
-- CONFIRMAR EMAIL Y CREAR ADMIN - TODO EN UNO
-- ============================================================================
-- Este script confirma el email del usuario y lo convierte en admin
-- ============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_clinic_id UUID;
    v_user_email TEXT := 'admin@clinova.com'; -- ⚠️ CAMBIAR ESTE EMAIL
    v_full_name TEXT := 'Administrador Principal'; -- ⚠️ CAMBIAR NOMBRE
BEGIN
    -- Buscar el user_id del email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_user_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario con email % no encontrado. Primero créalo en Authentication → Users → Add user', v_user_email;
    END IF;

    -- PASO 1: Confirmar el email del usuario
    UPDATE auth.users
    SET
        email_confirmed_at = NOW()
    WHERE id = v_user_id;

    RAISE NOTICE '✅ Email confirmado';

    -- PASO 2: Obtener o crear la clínica principal
    SELECT id INTO v_clinic_id
    FROM public.clinics
    ORDER BY created_at
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
            'Clínica Principal',
            'clinica-principal',
            v_user_email,
            'professional',
            'active',
            true
        )
        RETURNING id INTO v_clinic_id;

        RAISE NOTICE '✅ Clínica principal creada con ID: %', v_clinic_id;
    END IF;

    -- PASO 3: Crear o actualizar el perfil del usuario
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

    -- PASO 4: Actualizar metadata del usuario en auth.users
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
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ ¡Usuario administrador listo!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Email: %', v_user_email;
    RAISE NOTICE '👤 Nombre: %', v_full_name;
    RAISE NOTICE '🆔 User ID: %', v_user_id;
    RAISE NOTICE '🏥 Clinic ID: %', v_clinic_id;
    RAISE NOTICE '🎯 Rol: admin';
    RAISE NOTICE '✉️  Email: CONFIRMADO';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Ahora puedes iniciar sesión con este usuario';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- VERIFICAR QUE TODO ESTÁ CORRECTO
-- ============================================================================

SELECT
    u.id,
    u.email,
    u.email_confirmed_at,
    u.confirmed_at,
    up.full_name,
    up.role,
    c.name as clinic_name,
    up.is_active,
    u.raw_user_meta_data->>'role' as metadata_role,
    CASE
        WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
        ELSE '❌ No confirmado'
    END as email_status
FROM auth.users u
LEFT JOIN public.user_profiles up ON up.id = u.id
LEFT JOIN public.clinics c ON c.id = up.clinic_id
WHERE u.email = 'admin@clinova.com' -- ⚠️ CAMBIAR EMAIL
ORDER BY u.created_at DESC;
