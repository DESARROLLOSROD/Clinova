-- ============================================================================
-- CLINOVA - Módulo de Biblioteca de Ejercicios y Prescripciones (HEP)
-- ============================================================================

-- 1. Asegurar campos extra en exercise_library
-- (Asumimos que la tabla ya existe según supabase_schema_complete.sql)
alter table public.exercise_library 
add column if not exists instructions text,
add column if not exists video_url text,
add column if not exists thumbnail_url text,
add column if not exists category text,
add column if not exists difficulty text check (difficulty in ('easy', 'medium', 'hard'));

-- 2. Tabla de Prescripciones a Pacientes
create table public.patient_prescriptions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  therapist_id uuid references auth.users(id),
  
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
  general_notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Detalle de Ejercicios en la Prescripción
create table public.prescription_items (
  id uuid default gen_random_uuid() primary key,
  prescription_id uuid references public.patient_prescriptions(id) on delete cascade not null,
  exercise_id uuid references public.exercise_library(id) on delete cascade not null,
  
  sets integer,
  reps integer,
  weight text,
  duration text, -- Ej: "30 segundos"
  frequency text, -- Ej: "3 veces al día"
  specific_notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index idx_prescriptions_patient on public.patient_prescriptions(patient_id);
create index idx_prescriptions_therapist on public.patient_prescriptions(therapist_id);
create index idx_prescription_items_parent on public.prescription_items(prescription_id);

-- RLS
alter table public.patient_prescriptions enable row level security;
alter table public.prescription_items enable row level security;

create policy "Authenticated users can manage prescriptions"
  on public.patient_prescriptions for all
  using (auth.role() = 'authenticated');

create policy "Authenticated users can manage prescription items"
  on public.prescription_items for all
  using (auth.role() = 'authenticated');

-- Insertar algunos ejemplos de categorías para la biblioteca
-- Insertar datos base si es necesario (opcional)
