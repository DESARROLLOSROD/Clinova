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
-- 5. MÓDULO DE PLANTILLAS DE TRATAMIENTO
-- ============================================================================

-- Crear tabla de plantillas de tratamiento
create table public.treatment_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text,
  duration_minutes integer,
  frequency text,
  objectives text[],
  contraindications text[],
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear tabla de técnicas/procedimientos en plantillas
create table public.template_techniques (
  id uuid default gen_random_uuid() primary key,
  template_id uuid references public.treatment_templates(id) on delete cascade not null,
  name text not null,
  description text,
  duration_minutes integer,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear tabla de asignación de plantillas a pacientes
create table public.patient_treatment_plans (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  template_id uuid references public.treatment_templates(id) on delete set null,
  therapist_id uuid references auth.users(id) on delete set null,
  start_date date not null,
  end_date date,
  status text default 'active' check (status in ('active', 'completed', 'paused', 'cancelled')),
  goals text,
  progress_notes text,
  sessions_planned integer,
  sessions_completed integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.treatment_templates enable row level security;
alter table public.template_techniques enable row level security;
alter table public.patient_treatment_plans enable row level security;

-- Crear políticas
create policy "Enable all access for authenticated users" on public.treatment_templates
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on public.template_techniques
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on public.patient_treatment_plans
  for all using (auth.role() = 'authenticated');

-- Crear índices
create index treatment_templates_category_idx on public.treatment_templates(category);
create index treatment_templates_is_active_idx on public.treatment_templates(is_active);
create index template_techniques_template_id_idx on public.template_techniques(template_id);
create index patient_treatment_plans_patient_id_idx on public.patient_treatment_plans(patient_id);
create index patient_treatment_plans_status_idx on public.patient_treatment_plans(status);

-- ============================================================================
-- 6. MÓDULO DE PRESCRIPCIÓN DE EJERCICIOS
-- ============================================================================

-- Crear tabla de biblioteca de ejercicios
create table public.exercise_library (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text,
  body_part text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  equipment_needed text[],
  instructions text,
  video_url text,
  image_url text,
  contraindications text[],
  created_by uuid references auth.users(id) on delete set null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear tabla de prescripciones de ejercicios para pacientes
create table public.patient_exercise_prescriptions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  exercise_id uuid references public.exercise_library(id) on delete set null,
  prescribed_by uuid references auth.users(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  sets integer,
  repetitions integer,
  duration_seconds integer,
  frequency text,
  notes text,
  start_date date default current_date,
  end_date date,
  status text default 'active' check (status in ('active', 'completed', 'discontinued')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear tabla de seguimiento de adherencia
create table public.exercise_adherence_log (
  id uuid default gen_random_uuid() primary key,
  prescription_id uuid references public.patient_exercise_prescriptions(id) on delete cascade not null,
  completed_date date not null,
  sets_completed integer,
  repetitions_completed integer,
  duration_seconds integer,
  difficulty_rating integer check (difficulty_rating >= 1 and difficulty_rating <= 10),
  pain_level integer check (pain_level >= 0 and pain_level <= 10),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.exercise_library enable row level security;
alter table public.patient_exercise_prescriptions enable row level security;
alter table public.exercise_adherence_log enable row level security;

-- Crear políticas
create policy "Enable all access for authenticated users" on public.exercise_library
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on public.patient_exercise_prescriptions
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on public.exercise_adherence_log
  for all using (auth.role() = 'authenticated');

-- Crear índices
create index exercise_library_category_idx on public.exercise_library(category);
create index exercise_library_body_part_idx on public.exercise_library(body_part);
create index exercise_library_is_active_idx on public.exercise_library(is_active);
create index patient_exercise_prescriptions_patient_id_idx on public.patient_exercise_prescriptions(patient_id);
create index patient_exercise_prescriptions_status_idx on public.patient_exercise_prescriptions(status);
create index exercise_adherence_log_prescription_id_idx on public.exercise_adherence_log(prescription_id);
create index exercise_adherence_log_completed_date_idx on public.exercise_adherence_log(completed_date desc);

-- ============================================================================
-- 7. MÓDULO DE HISTORIAL MÉDICO
-- ============================================================================

-- Crear tabla de historial médico del paciente
create table public.patient_medical_history (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  allergies text[],
  chronic_conditions text[],
  current_medications text[],
  previous_surgeries text[],
  family_history text,
  lifestyle_notes text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  blood_type text,
  height_cm decimal(5,2),
  weight_kg decimal(5,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint unique_patient_medical_history unique (patient_id)
);

-- Crear tabla de evaluaciones iniciales
create table public.initial_assessments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  assessed_by uuid references auth.users(id) on delete set null,
  assessment_date date not null,
  chief_complaint text not null,
  history_of_present_illness text,
  pain_description text,
  pain_location text,
  pain_intensity integer check (pain_intensity >= 0 and pain_intensity <= 10),
  onset_date date,
  aggravating_factors text[],
  relieving_factors text[],
  functional_limitations text,
  previous_treatments text,
  assessment_findings text,
  diagnosis text,
  treatment_goals text[],
  recommended_treatment_plan text,
  prognosis text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Crear tabla de mediciones y valoraciones
create table public.patient_measurements (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  session_id uuid references public.sessions(id) on delete set null,
  measured_by uuid references auth.users(id) on delete set null,
  measurement_date date not null,
  measurement_type text not null,
  body_part text,
  measurement_value decimal(10,2),
  measurement_unit text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.patient_medical_history enable row level security;
alter table public.initial_assessments enable row level security;
alter table public.patient_measurements enable row level security;

-- Crear políticas
create policy "Enable all access for authenticated users" on public.patient_medical_history
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on public.initial_assessments
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on public.patient_measurements
  for all using (auth.role() = 'authenticated');

-- Crear índices
create index patient_medical_history_patient_id_idx on public.patient_medical_history(patient_id);
create index initial_assessments_patient_id_idx on public.initial_assessments(patient_id);
create index initial_assessments_assessment_date_idx on public.initial_assessments(assessment_date desc);
create index patient_measurements_patient_id_idx on public.patient_measurements(patient_id);
create index patient_measurements_session_id_idx on public.patient_measurements(session_id);
create index patient_measurements_measurement_date_idx on public.patient_measurements(measurement_date desc);

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================

-- Verificar tablas creadas
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
