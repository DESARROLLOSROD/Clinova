-- ============================================================================
-- CLINOVA - Sistema de Gestión para Clínicas de Fisioterapia
-- Schema Completo de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE PACIENTES
-- ============================================================================

-- Crear tabla de pacientes
create table public.patients (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  date_of_birth date,
  notes text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.patients enable row level security;

-- Crear políticas
create policy "Enable all access for authenticated users" on public.patients
  for all using (auth.role() = 'authenticated');

-- ============================================================================
-- 2. TABLA DE CITAS (APPOINTMENTS)
-- ============================================================================

-- Crear enum de estado de citas
create type public.appointment_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');

-- Crear tabla de citas
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  therapist_id uuid references auth.users(id) on delete set null,
  title text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status appointment_status default 'scheduled',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.appointments enable row level security;

-- Crear políticas
create policy "Enable all access for authenticated users" on public.appointments
  for all using (auth.role() = 'authenticated');

-- ============================================================================
-- 3. TABLA DE SESIONES (SESSIONS)
-- ============================================================================

-- Crear tabla de sesiones
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade not null,
  subjective text, -- S: Lo que el paciente dice
  objective text,  -- O: Lo que el terapeuta observa/mide
  assessment text, -- A: Diagnóstico/Análisis
  plan text,       -- P: Plan de tratamiento
  pain_level integer check (pain_level >= 0 and pain_level <= 10),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.sessions enable row level security;

-- Crear políticas
create policy "Enable all access for authenticated users" on public.sessions
  for all using (auth.role() = 'authenticated');

-- ============================================================================
-- 4. TABLA DE PAGOS (PAYMENTS)
-- ============================================================================

-- Crear enum de método de pago
create type public.payment_method as enum ('cash', 'card', 'transfer', 'insurance');

-- Crear enum de estado de pago
create type public.payment_status as enum ('pending', 'completed', 'cancelled', 'refunded');

-- Crear tabla de pagos
create table public.payments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  session_id uuid references public.sessions(id) on delete set null,
  amount decimal(10,2) not null check (amount >= 0),
  method payment_method not null,
  status payment_status default 'completed',
  description text,
  invoice_number text,
  payment_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.payments enable row level security;

-- Crear políticas
create policy "Enable all access for authenticated users" on public.payments
  for all using (auth.role() = 'authenticated');

-- Crear índices para optimizar consultas
create index payments_patient_id_idx on public.payments(patient_id);
create index payments_session_id_idx on public.payments(session_id);
create index payments_payment_date_idx on public.payments(payment_date desc);

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================

-- Verificar tablas creadas
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
