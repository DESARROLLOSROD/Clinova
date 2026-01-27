-- ============================================================================
-- CLINOVA - CREAR SUPER ADMIN (Administrador de Plataforma)
-- ============================================================================
-- El Super Admin puede:
-- - Ver y administrar TODAS las clinicas
-- - Crear nuevas clinicas
-- - Gestionar planes de suscripcion
-- - Acceder a todos los datos de la plataforma
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Primero ejecuta SCHEMA_COMPLETO_2026.sql
-- 2. Crea un usuario en Supabase Auth (Dashboard -> Authentication -> Users)
-- 3. Copia el UUID del usuario
-- 4. Reemplaza 'TU_USER_ID_AQUI' con el UUID real
-- 5. Ejecuta este script
-- ============================================================================

-- Paso 1: Ver usuarios existentes (ejecuta esto primero)
-- SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- ============================================================================
-- CONFIGURACION - EDITA ESTOS VALORES
-- ============================================================================
DO $$
DECLARE
    -- REEMPLAZA ESTE VALOR:
    v_user_id UUID := 'TU_USER_ID_AQUI';  -- UUID del usuario de auth.users
    v_user_name TEXT := 'Super Administrador';   -- Tu nombre completo

    -- Variables internas
    v_user_email TEXT;
    v_admin_clinic_id UUID;
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

3. Ejecuta el script nuevamente
========================================';
    END IF;

    -- Obtener email del usuario
    SELECT email INTO v_user_email
    FROM auth.users
    WHERE id = v_user_id;

    IF v_user_email IS NULL THEN
        RAISE EXCEPTION 'Usuario con ID % no encontrado en auth.users', v_user_id;
    END IF;

    RAISE NOTICE 'Configurando Super Admin para: % (%)', v_user_email, v_user_id;

    -- =====================================================
    -- Crear Clinica Administrativa (para el super admin)
    -- =====================================================
    INSERT INTO public.clinics (
        name,
        slug,
        email,
        subscription_tier,
        subscription_status,
        max_users,
        max_patients,
        is_active,
        created_by
    )
    VALUES (
        'Clinova Administracion',
        'clinova-admin',
        v_user_email,
        'enterprise',
        'active',
        999,
        999999,
        true,
        v_user_id
    )
    ON CONFLICT (slug) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = NOW()
    RETURNING id INTO v_admin_clinic_id;

    RAISE NOTICE 'Clinica administrativa creada/actualizada con ID: %', v_admin_clinic_id;

    -- =====================================================
    -- Crear el perfil de Super Admin
    -- =====================================================
    -- NOTA: Super Admin tiene clinic_id NULL porque no pertenece a una clinica especifica
    -- Puede ver TODAS las clinicas

    INSERT INTO public.user_profiles (
        id,
        role,
        clinic_id,  -- NULL para super_admin
        full_name,
        professional_title,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        v_user_id,
        'super_admin',
        NULL,  -- Super admin NO tiene clinica asignada
        v_user_name,
        'Administrador de Plataforma',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'super_admin',
        clinic_id = NULL,
        full_name = EXCLUDED.full_name,
        professional_title = 'Administrador de Plataforma',
        is_active = true,
        updated_at = NOW();

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUPER ADMIN CONFIGURADO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Usuario: %', v_user_email;
    RAISE NOTICE 'Rol: super_admin';
    RAISE NOTICE 'Clinica Admin ID: %', v_admin_clinic_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Permisos del Super Admin:';
    RAISE NOTICE '  - Ver TODAS las clinicas';
    RAISE NOTICE '  - Crear nuevas clinicas';
    RAISE NOTICE '  - Gestionar usuarios de cualquier clinica';
    RAISE NOTICE '  - Acceder a todos los datos';
    RAISE NOTICE '  - Gestionar planes de suscripcion';
    RAISE NOTICE '';
    RAISE NOTICE 'Ya puedes iniciar sesion en la aplicacion!';
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- VERIFICAR CONFIGURACION
-- ============================================================================

SELECT
    up.id,
    au.email,
    up.full_name,
    up.role,
    up.professional_title,
    up.clinic_id,
    COALESCE(c.name, '(Acceso global - Sin clinica asignada)') as clinic_name,
    up.is_active
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.id
LEFT JOIN public.clinics c ON c.id = up.clinic_id
WHERE up.role = 'super_admin'
ORDER BY up.created_at DESC;

-- ============================================================================
-- VER TODAS LAS CLINICAS (el super admin puede ver todas)
-- ============================================================================

SELECT
    id,
    name,
    slug,
    email,
    subscription_tier,
    subscription_status,
    max_users,
    max_patients,
    is_active,
    created_at
FROM public.clinics
ORDER BY created_at DESC;
