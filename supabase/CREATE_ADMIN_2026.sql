-- ============================================================================
-- CLINOVA - CREAR USUARIO ADMINISTRADOR
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Primero, crea un usuario en Supabase Auth (Dashboard -> Authentication -> Users)
-- 2. Copia el UUID del usuario creado
-- 3. Reemplaza 'TU_USER_ID_AQUI' con el UUID real
-- 4. Ejecuta este script en SQL Editor
-- ============================================================================

-- Paso 1: Obtener el ID de tu usuario (ejecuta esto primero para ver los usuarios)
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- ============================================================================
-- CONFIGURACION - EDITA ESTOS VALORES
-- ============================================================================
DO $$
DECLARE
    -- REEMPLAZA ESTOS VALORES:
    v_user_id UUID := 'TU_USER_ID_AQUI';  -- UUID del usuario de auth.users
    v_clinic_name TEXT := 'Mi Clinica';    -- Nombre de tu clinica
    v_clinic_slug TEXT := 'mi-clinica';    -- Slug unico (sin espacios, minusculas)
    v_user_name TEXT := 'Administrador';   -- Tu nombre completo

    -- Variables internas
    v_user_email TEXT;
    v_clinic_id UUID;
BEGIN
    -- Validar que se cambio el user_id
    IF v_user_id::text = 'TU_USER_ID_AQUI' THEN
        RAISE EXCEPTION '

========================================
ERROR: Debes editar este script primero!
========================================

1. Ejecuta esta consulta para obtener tu user ID:
   SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

2. Copia tu UUID y reemplaza TU_USER_ID_AQUI en este script

3. Opcionalmente cambia el nombre de la clinica y tu nombre

4. Ejecuta el script nuevamente
========================================';
    END IF;

    -- Obtener email del usuario
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;

    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'Usuario con ID % no encontrado en auth.users', v_user_id;
    END IF;

    RAISE NOTICE 'Creando perfil para: % (%)', v_user_email, v_user_id;

    -- Crear la clinica
    INSERT INTO public.clinics (
        name,
        slug,
        email,
        subscription_tier,
        subscription_status,
        trial_ends_at,
        max_users,
        max_patients,
        created_by
    )
    VALUES (
        v_clinic_name,
        v_clinic_slug,
        v_user_email,
        'professional',
        'trial',
        NOW() + INTERVAL '30 days',
        10,
        500,
        v_user_id
    )
    ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW()
    RETURNING id INTO v_clinic_id;

    RAISE NOTICE 'Clinica creada/actualizada con ID: %', v_clinic_id;

    -- Crear el perfil de usuario como clinic_manager
    INSERT INTO public.user_profiles (
        id,
        role,
        clinic_id,
        full_name,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        v_user_id,
        'clinic_manager',
        v_clinic_id,
        v_user_name,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'clinic_manager',
        clinic_id = v_clinic_id,
        full_name = EXCLUDED.full_name,
        is_active = true,
        updated_at = NOW();

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CONFIGURACION COMPLETADA!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Usuario: %', v_user_email;
    RAISE NOTICE 'Rol: clinic_manager';
    RAISE NOTICE 'Clinica: % (ID: %)', v_clinic_name, v_clinic_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Ya puedes iniciar sesion en la aplicacion!';
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- VERIFICAR CONFIGURACION (ejecuta despues de crear el admin)
-- ============================================================================
/*
SELECT
    up.id,
    up.full_name,
    up.role,
    c.name as clinic_name,
    c.subscription_tier,
    c.subscription_status,
    c.trial_ends_at,
    au.email
FROM public.user_profiles up
JOIN public.clinics c ON c.id = up.clinic_id
JOIN auth.users au ON au.id = up.id
ORDER BY up.created_at DESC;
*/
