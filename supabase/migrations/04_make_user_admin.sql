-- =====================================================
-- Función: make_user_admin_by_email
-- Descripción: Asigna el rol de administrador a un
--              usuario existente a través de su email.
-- =====================================================
CREATE OR REPLACE FUNCTION public.make_user_admin_by_email(
    p_email TEXT
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_clinic_id UUID;
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

    -- Crear una clínica si no existe ninguna
    IF NOT EXISTS (SELECT 1 FROM public.clinics) THEN
        INSERT INTO public.clinics (name, slug) VALUES ('Clínica Principal', 'clinica-principal');
    END IF;

    -- Obtener el clinic_id
    SELECT id INTO v_clinic_id FROM public.clinics LIMIT 1;

    -- Crear el perfil del usuario
    INSERT INTO public.user_profiles (id, role, clinic_id, full_name)
    VALUES (v_user_id, 'admin', v_clinic_id, 'Admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin';

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
