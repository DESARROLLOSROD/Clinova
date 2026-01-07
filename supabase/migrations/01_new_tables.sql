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
