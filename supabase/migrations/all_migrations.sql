-- =====================================================
-- Helper Function: update_updated_at_column
-- Descripción: Actualiza el campo updated_at a la hora actual
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- Tabla: clinics
-- Descripción: Clínicas registradas en la plataforma
-- =====================================================
create table public.clinics (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  email text,
  phone text,
  website text,
  address text,
  city text,
  state text,
  postal_code text,
  country text default 'MX',
  timezone text default 'America/Mexico_City',
  currency text default 'MXN',
  language text default 'es',
  business_hours jsonb default '{
    "monday": {"open": "08:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
    "thursday": {"open": "08:00", "close": "18:00", "closed": false},
    "friday": {"open": "08:00", "close": "18:00", "closed": false},
    "saturday": {"open": "09:00", "close": "14:00", "closed": false},
    "sunday": {"open": "09:00", "close": "14:00", "closed": true}
  }'::jsonb,
  default_appointment_duration integer default 60,
  allow_online_booking boolean default false,
  require_payment_upfront boolean default false,
  subscription_tier text default 'basic' check (subscription_tier in ('basic', 'professional', 'enterprise')),
  subscription_status text default 'trial' check (subscription_status in ('trial', 'active', 'cancelled', 'suspended')),
  trial_ends_at timestamp with time zone,
  subscription_started_at timestamp with time zone,
  max_users integer default 2,
  max_patients integer default 100,
  logo_url text,
  primary_color text default '#3B82F6',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null
);
create unique index clinics_slug_idx on public.clinics(slug);
create index clinics_subscription_status_idx on public.clinics(subscription_status);
create index clinics_is_active_idx on public.clinics(is_active);
comment on table public.clinics is 'Clínicas registradas en la plataforma';
comment on column public.clinics.slug is 'Slug único para subdominio (ej: fisioterapia-cdmx)';
comment on column public.clinics.business_hours is 'Horario de atención por día (JSON)';

create trigger update_clinics_updated_at
  before update on public.clinics
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- Tabla: user_profiles
-- Descripción: Perfiles de usuario con rol y clínica
-- =====================================================
create table public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('admin', 'therapist', 'receptionist', 'patient')),
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  full_name text not null,
  professional_title text,
  phone text,
  avatar_url text,
  settings jsonb default '{
    "notifications_enabled": true,
    "email_reminders": true,
    "sms_reminders": false,
    "language": "es",
    "theme": "light"
  }'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null,
  last_login_at timestamp with time zone
);
create index user_profiles_clinic_id_idx on public.user_profiles(clinic_id);
create index user_profiles_role_idx on public.user_profiles(role);
create index user_profiles_is_active_idx on public.user_profiles(is_active);
comment on table public.user_profiles is 'Perfiles de usuario con rol y clínica';
comment on column public.user_profiles.role is 'Rol: admin, therapist, receptionist, patient';
comment on column public.user_profiles.settings is 'Configuración personalizada del usuario (JSON)';

create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function update_updated_at_column();

-- =====================================================
-- Tabla: audit_log
-- Descripción: Registro de auditoría de acciones
-- =====================================================
create table public.audit_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  changes jsonb,
  metadata jsonb,
  success boolean default true,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index audit_log_user_id_idx on public.audit_log(user_id);
create index audit_log_clinic_id_idx on public.audit_log(clinic_id);
create index audit_log_action_idx on public.audit_log(action);
create index audit_log_resource_type_idx on public.audit_log(resource_type);
create index audit_log_created_at_idx on public.audit_log(created_at desc);
comment on table public.audit_log is 'Registro de auditoría de acciones críticas';
comment on column public.audit_log.changes is 'Objeto JSON con before/after para updates';
comment on column public.audit_log.metadata is 'IP, user agent, y otra metadata';

-- =====================================================
-- RLS Policies for New Tables
-- Note: Moved here to ensure tables exist before policies are created.
-- =====================================================

-- Clinics RLS
alter table public.clinics enable row level security;
create policy "Users can view their own clinic"
on public.clinics for select
using (
  id in (
    select clinic_id from user_profiles where id = auth.uid()
  )
);
create policy "Only admins can update clinic"
on public.clinics for update
using (
  id in (
    select clinic_id from user_profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- User Profiles RLS
alter table public.user_profiles enable row level security;
create policy "Users can view own profile"
on public.user_profiles for select
using (auth.uid() = id);
create policy "Users can view profiles from their clinic"
on public.user_profiles for select
using (
  clinic_id in (
    select clinic_id from user_profiles where id = auth.uid()
  )
);
create policy "Only admins can create users"
on public.user_profiles for insert
with check (
  exists (
    select 1 from user_profiles
    where id = auth.uid() and role = 'admin'
  )
);
create policy "Only admins can update users"
on public.user_profiles for update
using (
  exists (
    select 1 from user_profiles
    where id = auth.uid() and role = 'admin'
  )
);
create policy "Users can update own profile"
on public.user_profiles for update
using (auth.uid() = id);

-- Audit Log RLS
alter table public.audit_log enable row level security;
create policy "Only admins can view audit log"
on public.audit_log for select
using (
  exists (
    select 1 from user_profiles
    where id = auth.uid() and role = 'admin' and clinic_id = audit_log.clinic_id
  )
);
create policy "System can insert audit log"
on public.audit_log for insert
with check (true);
-- =====================================================
-- Migración: Agregar clinic_id a tablas existentes
-- =====================================================

-- Nota: Estas migraciones deben ejecutarse en orden.
-- Después de ejecutar este script, se deben rellenar los datos de clinic_id
-- antes de establecer la columna como NOT NULL.

-- 1. Patients
alter table public.patients
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index patients_clinic_id_idx on public.patients(clinic_id);

-- 2. Appointments
alter table public.appointments
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index appointments_clinic_id_idx on public.appointments(clinic_id);

-- 3. Payments
-- Asumiendo que la tabla de pagos se llama 'payments'
alter table public.payments
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index payments_clinic_id_idx on public.payments(clinic_id);

-- 4. Exercise Library
-- Asumiendo que la tabla de la biblioteca de ejercicios se llama 'exercise_library'
-- Si el nombre es diferente (ej. 'exercises'), este script necesitará ser ajustado.
alter table public.exercise_library
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index exercise_library_clinic_id_idx on public.exercise_library(clinic_id);

-- 5. Treatment Templates
-- Asumiendo que la tabla de plantillas de tratamiento se llama 'treatment_templates'
alter table public.treatment_templates
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index treatment_templates_clinic_id_idx on public.treatment_templates(clinic_id);

-- Nota: Otras tablas como sessions, medical_history, etc., heredarán el
-- clinic_id a través de sus relaciones con estas tablas principales
-- (ej. a través de patient_id o appointment_id) y no necesitan una
-- columna clinic_id directa.
-- =====================================================
-- RLS Policies Script
-- Descripción: Elimina políticas antiguas e implementa
--              políticas granulares basadas en roles.
-- =====================================================

-- =====================================================
-- PASO 1: Eliminar políticas antiguas (demasiado permisivas)
-- =====================================================
drop policy if exists "Enable all access for authenticated users" on public.patients;
drop policy if exists "Enable all access for authenticated users" on public.appointments;
drop policy if exists "Enable all access for authenticated users" on public.sessions;
drop policy if exists "Enable all access for authenticated users" on public.payments;
drop policy if exists "Enable all access for authenticated users" on public.treatment_templates;
drop policy if exists "Enable all access for authenticated users" on public.template_techniques;
drop policy if exists "Enable all access for authenticated users" on public.patient_treatment_plans;
drop policy if exists "Enable all access for authenticated users" on public.exercise_library;
drop policy if exists "Enable all access for authenticated users" on public.patient_exercise_prescriptions;
drop policy if exists "Enable all access for authenticated users" on public.exercise_adherence_log;
drop policy if exists "Enable all access for authenticated users" on public.patient_medical_history;
drop policy if exists "Enable all access for authenticated users" on public.initial_assessments;
drop policy if exists "Enable all access for authenticated users" on public.patient_measurements;

-- =====================================================
-- PASO 2: Crear funciones Helper
-- =====================================================
create or replace function public.current_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.user_profiles where id = auth.uid()
$$;

create or replace function public.current_user_clinic()
returns uuid
language sql
security definer
stable
as $$
  select clinic_id from public.user_profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

create or replace function public.can_access_clinical_notes()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role in ('admin', 'therapist')
  )
$$;

-- =====================================================
-- PASO 3: Crear nuevas políticas RLS
-- =====================================================

-- RLS Policies: patients
alter table public.patients enable row level security;
create policy "Users can view patients from their clinic"
on public.patients for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist', 'receptionist')
);
create policy "Authorized users can create patients"
on public.patients for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist', 'receptionist')
);
create policy "Admin can update all patients"
on public.patients for update
using (
  clinic_id = current_user_clinic()
  and is_admin()
);
create policy "Therapists can update assigned patients"
on public.patients for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and (
    created_by = auth.uid()
    or id in (
      select distinct patient_id from appointments
      where therapist_id = auth.uid()
    )
  )
);
create policy "Only admin can delete patients"
on public.patients for delete
using (
  clinic_id = current_user_clinic()
  and is_admin()
);

-- RLS Policies: patient_medical_history
alter table public.patient_medical_history enable row level security;
create policy "Only clinical staff can view medical history"
on public.patient_medical_history for select
using (
  can_access_clinical_notes()
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);
create policy "Only clinical staff can modify medical history"
on public.patient_medical_history for insert
with check (
  can_access_clinical_notes()
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);
create policy "Only clinical staff can update medical history"
on public.patient_medical_history for update
using (
  can_access_clinical_notes()
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);

-- RLS Policies: appointments
alter table public.appointments enable row level security;
create policy "Admin and receptionist view all appointments"
on public.appointments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'receptionist')
);
create policy "Therapists view assigned appointments"
on public.appointments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and (therapist_id = auth.uid() or therapist_id is null)
);
create policy "Authorized users can create appointments"
on public.appointments for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist', 'receptionist')
);
create policy "Admin can update all appointments"
on public.appointments for update
using (
  clinic_id = current_user_clinic()
  and is_admin()
);
create policy "Therapists can update their appointments"
on public.appointments for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and therapist_id = auth.uid()
);
create policy "Receptionists can update appointments"
on public.appointments for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'receptionist'
);
create policy "Only admin can delete appointments"
on public.appointments for delete
using (
  clinic_id = current_user_clinic()
  and is_admin()
);

-- RLS Policies: sessions
alter table public.sessions enable row level security;
create policy "Only clinical staff can view sessions"
on public.sessions for select
using (
  can_access_clinical_notes()
  and appointment_id in (
    select id from appointments where clinic_id = current_user_clinic()
  )
);
create policy "Only clinical staff can create sessions"
on public.sessions for insert
with check (
  can_access_clinical_notes()
  and appointment_id in (
    select id from appointments where clinic_id = current_user_clinic()
  )
);
create policy "Therapists can update own sessions within 24h"
on public.sessions for update
using (
  can_access_clinical_notes()
  and created_by = auth.uid()
  and created_at > now() - interval '24 hours'
);
create policy "Admin can update all sessions"
on public.sessions for update
using (
  is_admin()
  and appointment_id in (
    select id from appointments where clinic_id = current_user_clinic()
  )
);

-- RLS Policies: payments
alter table public.payments enable row level security;
create policy "Admin and receptionist view all payments"
on public.payments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'receptionist')
);
create policy "Therapists view payments of their patients"
on public.payments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and patient_id in (
    select distinct patient_id from appointments
    where therapist_id = auth.uid()
  )
);
create policy "Authorized users can create payments"
on public.payments for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'receptionist')
);
create policy "Admin can update payments"
on public.payments for update
using (
  clinic_id = current_user_clinic()
  and is_admin()
);
create policy "Receptionist can update recent payments"
on public.payments for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'receptionist'
  and created_at > now() - interval '24 hours'
);

-- RLS Policies: exercise_library
alter table public.exercise_library enable row level security;
create policy "Clinical staff can view exercise library"
on public.exercise_library for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist')
);
create policy "Clinical staff can manage exercises"
on public.exercise_library for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist')
);
create policy "Clinical staff can update exercises"
on public.exercise_library for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist')
);

-- RLS Policies: patient_exercise_prescriptions
alter table public.patient_exercise_prescriptions enable row level security;
create policy "Clinical staff can view prescriptions"
on public.patient_exercise_prescriptions for select
using (
  patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
  and current_user_role() in ('admin', 'therapist')
);
create policy "Patients can view own prescriptions"
on public.patient_exercise_prescriptions for select
using (
  patient_id in (
    select id from patients
    where email = (select email from auth.users where id = auth.uid())
  )
);
create policy "Only clinical staff can prescribe exercises"
on public.patient_exercise_prescriptions for insert
with check (
  current_user_role() in ('admin', 'therapist')
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);
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
