-- ============================================================================
-- VERIFICAR SETUP DEL SISTEMA DE ROLES
-- ============================================================================
-- Ejecuta estas queries para verificar que todo está configurado correctamente
-- ============================================================================

-- ============================================================================
-- 1. VERIFICAR TABLAS CREADAS
-- ============================================================================

SELECT
    '✅ Tablas del sistema de roles' as verificacion,
    CASE
        WHEN COUNT(*) = 4 THEN '✓ Todas las tablas creadas'
        ELSE '✗ Faltan tablas: ' || (4 - COUNT(*))::TEXT
    END as resultado
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('roles', 'permissions', 'role_permissions', 'user_roles');

-- ============================================================================
-- 2. VERIFICAR ROLES CREADOS
-- ============================================================================

SELECT
    '📋 Roles disponibles' as seccion,
    name as rol,
    display_name as nombre,
    description as descripcion
FROM public.roles
ORDER BY
    CASE name
        WHEN 'admin' THEN 1
        WHEN 'therapist' THEN 2
        WHEN 'receptionist' THEN 3
        WHEN 'patient' THEN 4
    END;

-- ============================================================================
-- 3. VERIFICAR PERMISOS POR CATEGORÍA
-- ============================================================================

SELECT
    category as categoria,
    COUNT(*) as total_permisos,
    string_agg(name, ', ' ORDER BY name) as permisos
FROM public.permissions
GROUP BY category
ORDER BY category;

-- ============================================================================
-- 4. VERIFICAR PERMISOS ASIGNADOS A CADA ROL
-- ============================================================================

SELECT
    r.display_name as rol,
    COUNT(rp.permission_id) as total_permisos,
    CASE
        WHEN r.name = 'admin' THEN
            CASE WHEN COUNT(rp.permission_id) >= 55 THEN '✓' ELSE '✗' END
        WHEN r.name = 'therapist' THEN
            CASE WHEN COUNT(rp.permission_id) >= 20 THEN '✓' ELSE '✗' END
        WHEN r.name = 'receptionist' THEN
            CASE WHEN COUNT(rp.permission_id) >= 13 THEN '✓' ELSE '✗' END
        WHEN r.name = 'patient' THEN
            CASE WHEN COUNT(rp.permission_id) >= 7 THEN '✓' ELSE '✗' END
    END as estado
FROM public.roles r
LEFT JOIN public.role_permissions rp ON rp.role_id = r.id
GROUP BY r.id, r.name, r.display_name
ORDER BY r.name;

-- ============================================================================
-- 5. VER PERMISOS DETALLADOS DE CADA ROL
-- ============================================================================

-- Permisos de Admin
SELECT
    'ADMIN' as rol,
    p.category as categoria,
    COUNT(*) as permisos
FROM public.roles r
JOIN public.role_permissions rp ON rp.role_id = r.id
JOIN public.permissions p ON p.id = rp.permission_id
WHERE r.name = 'admin'
GROUP BY p.category
ORDER BY p.category;

-- Permisos de Therapist
SELECT
    'THERAPIST' as rol,
    p.category as categoria,
    string_agg(p.name, ', ' ORDER BY p.name) as permisos
FROM public.roles r
JOIN public.role_permissions rp ON rp.role_id = r.id
JOIN public.permissions p ON p.id = rp.permission_id
WHERE r.name = 'therapist'
GROUP BY p.category
ORDER BY p.category;

-- Permisos de Receptionist
SELECT
    'RECEPTIONIST' as rol,
    p.category as categoria,
    string_agg(p.name, ', ' ORDER BY p.name) as permisos
FROM public.roles r
JOIN public.role_permissions rp ON rp.role_id = r.id
JOIN public.permissions p ON p.id = rp.permission_id
WHERE r.name = 'receptionist'
GROUP BY p.category
ORDER BY p.category;

-- Permisos de Patient
SELECT
    'PATIENT' as rol,
    p.category as categoria,
    string_agg(p.name, ', ' ORDER BY p.name) as permisos
FROM public.roles r
JOIN public.role_permissions rp ON rp.role_id = r.id
JOIN public.permissions p ON p.id = rp.permission_id
WHERE r.name = 'patient'
GROUP BY p.category
ORDER BY p.category;

-- ============================================================================
-- 6. VERIFICAR FUNCIONES SQL
-- ============================================================================

SELECT
    '🔧 Funciones SQL' as verificacion,
    proname as funcion,
    pg_get_function_result(oid) as retorna
FROM pg_proc
WHERE proname IN (
    'get_user_role',
    'user_has_permission',
    'get_user_permissions',
    'make_user_admin',
    'make_user_admin_by_email'
)
ORDER BY proname;

-- ============================================================================
-- 7. VERIFICAR POLÍTICAS RLS
-- ============================================================================

SELECT
    schemaname as esquema,
    tablename as tabla,
    policyname as politica,
    cmd as comando,
    CASE
        WHEN roles::text = '{authenticated}' THEN 'authenticated'
        ELSE roles::text
    END as roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('roles', 'permissions', 'role_permissions', 'user_roles', 'patients')
ORDER BY tablename, policyname;

-- ============================================================================
-- 8. VERIFICAR ÍNDICES
-- ============================================================================

SELECT
    tablename as tabla,
    indexname as indice,
    indexdef as definicion
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('user_roles', 'role_permissions', 'patients', 'therapists')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================================================
-- 9. VERIFICAR COLUMNAS AÑADIDAS
-- ============================================================================

-- Verificar columna role en therapists
SELECT
    'therapists.role' as columna,
    CASE
        WHEN column_name IS NOT NULL THEN '✓ Existe'
        ELSE '✗ No existe'
    END as estado,
    data_type as tipo
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'therapists'
AND column_name = 'role';

-- Verificar columnas en patients
SELECT
    'patients.' || column_name as columna,
    '✓' as estado,
    data_type as tipo
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patients'
AND column_name IN ('auth_user_id', 'medical_history', 'primary_therapist_id');

-- ============================================================================
-- 10. VERIFICAR USUARIOS Y SUS ROLES
-- ============================================================================

SELECT
    '👥 Usuarios registrados' as seccion,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN ur.role_id IS NOT NULL THEN 1 END) as usuarios_con_rol,
    COUNT(CASE WHEN ur.role_id IS NULL THEN 1 END) as usuarios_sin_rol
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id;

-- Detalle de usuarios
SELECT
    u.email,
    u.raw_user_meta_data->>'first_name' as nombre,
    u.raw_user_meta_data->>'last_name' as apellido,
    r.display_name as rol,
    u.created_at::date as fecha_creacion,
    u.last_sign_in_at::date as ultimo_acceso
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.roles r ON r.id = ur.role_id
ORDER BY u.created_at DESC
LIMIT 10;

-- ============================================================================
-- 11. PROBAR FUNCIONES
-- ============================================================================

-- Probar función get_user_role (requiere un user_id válido)
-- SELECT public.get_user_role('user-id-aqui');

-- Probar función user_has_permission
-- SELECT public.user_has_permission('user-id-aqui', 'patient:create');

-- Probar función get_user_permissions
-- SELECT * FROM public.get_user_permissions('user-id-aqui');

-- ============================================================================
-- 12. RESUMEN GENERAL
-- ============================================================================

DO $$
DECLARE
    v_roles_count INT;
    v_permissions_count INT;
    v_users_count INT;
    v_users_with_role INT;
    v_admin_count INT;
BEGIN
    SELECT COUNT(*) INTO v_roles_count FROM public.roles;
    SELECT COUNT(*) INTO v_permissions_count FROM public.permissions;
    SELECT COUNT(*) INTO v_users_count FROM auth.users;
    SELECT COUNT(*) INTO v_users_with_role FROM public.user_roles;
    SELECT COUNT(*) INTO v_admin_count
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE r.name = 'admin';

    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '         RESUMEN DEL SISTEMA DE ROLES';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Estadísticas:';
    RAISE NOTICE '   • Roles definidos: %', v_roles_count;
    RAISE NOTICE '   • Permisos creados: %', v_permissions_count;
    RAISE NOTICE '   • Usuarios totales: %', v_users_count;
    RAISE NOTICE '   • Usuarios con rol asignado: %', v_users_with_role;
    RAISE NOTICE '   • Administradores: %', v_admin_count;
    RAISE NOTICE '';

    IF v_roles_count = 4 THEN
        RAISE NOTICE '✅ Todos los roles están creados';
    ELSE
        RAISE NOTICE '⚠️  Faltan roles por crear';
    END IF;

    IF v_permissions_count >= 55 THEN
        RAISE NOTICE '✅ Todos los permisos están creados';
    ELSE
        RAISE NOTICE '⚠️  Faltan permisos por crear';
    END IF;

    IF v_admin_count > 0 THEN
        RAISE NOTICE '✅ Hay al menos un administrador';
    ELSE
        RAISE NOTICE '⚠️  NO HAY ADMINISTRADORES - Crear uno con create_admin_user.sql';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';

END $$;
