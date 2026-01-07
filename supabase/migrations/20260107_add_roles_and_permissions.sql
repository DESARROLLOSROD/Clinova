-- Migration: Add Roles and Permissions System
-- Created: 2026-01-07
-- Description: Implements formal role-based access control with roles and permissions tables

-- Create roles enum type
CREATE TYPE user_role AS ENUM ('admin', 'therapist', 'receptionist', 'patient');

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(role_id, permission_id)
);

-- Create user_roles table (allows for multiple roles if needed in future)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role_id)
);

-- Add role column to therapists table
ALTER TABLE public.therapists
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'therapist';

-- Insert default roles
INSERT INTO public.roles (name, display_name, description) VALUES
    ('admin', 'Administrador', 'Acceso completo al sistema, puede gestionar todos los usuarios y configuraciones'),
    ('therapist', 'Fisioterapeuta', 'Puede gestionar sus propios pacientes, citas y sesiones'),
    ('receptionist', 'Recepcionista', 'Puede gestionar pacientes, citas y pagos'),
    ('patient', 'Paciente', 'Acceso limitado a su propia información y citas')
ON CONFLICT (name) DO NOTHING;

-- Insert permissions
INSERT INTO public.permissions (name, category, description) VALUES
    -- Therapist permissions
    ('therapist:view:all', 'therapist', 'Ver todos los fisioterapeutas'),
    ('therapist:view:own', 'therapist', 'Ver propio perfil de fisioterapeuta'),
    ('therapist:create', 'therapist', 'Crear nuevos fisioterapeutas'),
    ('therapist:update:all', 'therapist', 'Actualizar cualquier fisioterapeuta'),
    ('therapist:update:own', 'therapist', 'Actualizar propio perfil'),
    ('therapist:delete', 'therapist', 'Eliminar fisioterapeutas'),

    -- Patient permissions
    ('patient:view:all', 'patient', 'Ver todos los pacientes'),
    ('patient:view:assigned', 'patient', 'Ver pacientes asignados'),
    ('patient:view:own', 'patient', 'Ver propio perfil de paciente'),
    ('patient:create', 'patient', 'Crear nuevos pacientes'),
    ('patient:update:all', 'patient', 'Actualizar cualquier paciente'),
    ('patient:update:assigned', 'patient', 'Actualizar pacientes asignados'),
    ('patient:update:own', 'patient', 'Actualizar propio perfil'),
    ('patient:delete', 'patient', 'Eliminar pacientes'),

    -- Appointment permissions
    ('appointment:view:all', 'appointment', 'Ver todas las citas'),
    ('appointment:view:assigned', 'appointment', 'Ver citas asignadas'),
    ('appointment:view:own', 'appointment', 'Ver propias citas'),
    ('appointment:create', 'appointment', 'Crear citas'),
    ('appointment:update:all', 'appointment', 'Actualizar cualquier cita'),
    ('appointment:update:assigned', 'appointment', 'Actualizar citas asignadas'),
    ('appointment:update:own', 'appointment', 'Actualizar propias citas'),
    ('appointment:delete', 'appointment', 'Eliminar citas'),

    -- Session permissions
    ('session:view:all', 'session', 'Ver todas las sesiones'),
    ('session:view:assigned', 'session', 'Ver sesiones asignadas'),
    ('session:view:own', 'session', 'Ver propias sesiones'),
    ('session:create', 'session', 'Crear sesiones'),
    ('session:update:all', 'session', 'Actualizar cualquier sesión'),
    ('session:update:assigned', 'session', 'Actualizar sesiones asignadas'),
    ('session:update:own', 'session', 'Actualizar propias sesiones'),
    ('session:delete', 'session', 'Eliminar sesiones'),

    -- Payment permissions
    ('payment:view:all', 'payment', 'Ver todos los pagos'),
    ('payment:view:assigned', 'payment', 'Ver pagos de pacientes asignados'),
    ('payment:view:own', 'payment', 'Ver propios pagos'),
    ('payment:create', 'payment', 'Crear pagos'),
    ('payment:update:all', 'payment', 'Actualizar cualquier pago'),
    ('payment:update:assigned', 'payment', 'Actualizar pagos asignados'),
    ('payment:delete', 'payment', 'Eliminar pagos'),

    -- Report permissions
    ('report:view:all', 'report', 'Ver todos los reportes'),
    ('report:view:assigned', 'report', 'Ver reportes de pacientes asignados'),
    ('report:view:own', 'report', 'Ver propios reportes'),
    ('report:create', 'report', 'Crear reportes'),

    -- Exercise & Template permissions
    ('exercise:view', 'exercise', 'Ver ejercicios'),
    ('exercise:create', 'exercise', 'Crear ejercicios'),
    ('exercise:update', 'exercise', 'Actualizar ejercicios'),
    ('exercise:delete', 'exercise', 'Eliminar ejercicios'),
    ('template:view', 'template', 'Ver plantillas'),
    ('template:create', 'template', 'Crear plantillas'),
    ('template:update', 'template', 'Actualizar plantillas'),
    ('template:delete', 'template', 'Eliminar plantillas'),

    -- Settings permissions
    ('settings:view', 'settings', 'Ver configuración'),
    ('settings:update', 'settings', 'Actualizar configuración'),

    -- User management permissions
    ('user:create', 'user', 'Crear usuarios'),
    ('user:update:all', 'user', 'Actualizar cualquier usuario'),
    ('user:delete', 'user', 'Eliminar usuarios')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to Admin role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to Therapist role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.name IN (
    'therapist:view:own',
    'therapist:update:own',
    'patient:view:assigned',
    'patient:create',
    'patient:update:assigned',
    'appointment:view:assigned',
    'appointment:create',
    'appointment:update:assigned',
    'session:view:assigned',
    'session:create',
    'session:update:assigned',
    'payment:view:assigned',
    'payment:create',
    'payment:update:assigned',
    'report:view:assigned',
    'report:create',
    'exercise:view',
    'exercise:create',
    'exercise:update',
    'template:view',
    'template:create',
    'template:update',
    'settings:view'
)
WHERE r.name = 'therapist'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to Receptionist role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.name IN (
    'therapist:view:all',
    'patient:view:all',
    'patient:create',
    'patient:update:all',
    'appointment:view:all',
    'appointment:create',
    'appointment:update:all',
    'session:view:all',
    'payment:view:all',
    'payment:create',
    'payment:update:all',
    'exercise:view',
    'template:view',
    'settings:view'
)
WHERE r.name = 'receptionist'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to Patient role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
JOIN public.permissions p ON p.name IN (
    'patient:view:own',
    'patient:update:own',
    'appointment:view:own',
    'session:view:own',
    'payment:view:own',
    'report:view:own',
    'exercise:view'
)
WHERE r.name = 'patient'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_therapists_role ON public.therapists(role);

-- Enable RLS on new tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles table
CREATE POLICY "Anyone can view roles"
    ON public.roles FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for permissions table
CREATE POLICY "Anyone can view permissions"
    ON public.permissions FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for role_permissions table
CREATE POLICY "Anyone can view role permissions"
    ON public.role_permissions FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
DECLARE
    user_role_result user_role;
BEGIN
    SELECT r.name INTO user_role_result
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_uuid
    LIMIT 1;

    RETURN user_role_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON rp.role_id = ur.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE ur.user_id = user_uuid AND p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all user permissions
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_uuid UUID)
RETURNS TABLE(permission_name TEXT, permission_category TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT p.name::TEXT, p.category::TEXT
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger for roles table
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.roles IS 'User roles definition table';
COMMENT ON TABLE public.permissions IS 'Available permissions in the system';
COMMENT ON TABLE public.role_permissions IS 'Maps permissions to roles';
COMMENT ON TABLE public.user_roles IS 'Maps roles to users';
COMMENT ON FUNCTION public.get_user_role IS 'Returns the primary role for a user';
COMMENT ON FUNCTION public.user_has_permission IS 'Checks if a user has a specific permission';
COMMENT ON FUNCTION public.get_user_permissions IS 'Returns all permissions for a user';
