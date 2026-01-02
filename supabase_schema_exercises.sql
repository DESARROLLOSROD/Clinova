-- ============================================================================
-- EXERCISE PRESCRIPTION MODULE
-- Módulo de Prescripción de Ejercicios
-- ============================================================================

-- Crear tabla de biblioteca de ejercicios
create table public.exercise_library (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text, -- Ej: "Fuerza", "Flexibilidad", "Equilibrio", "Cardiovascular"
  body_part text, -- Ej: "Hombro", "Rodilla", "Espalda"
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  equipment_needed text[], -- Array de equipamiento necesario
  instructions text, -- Instrucciones paso a paso
  video_url text, -- URL de video demostrativo (opcional)
  image_url text, -- URL de imagen (opcional)
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
  session_id uuid references public.sessions(id) on delete set null, -- Opcional: asociar a una sesión
  sets integer, -- Número de series
  repetitions integer, -- Número de repeticiones
  duration_seconds integer, -- Duración en segundos (para ejercicios de tiempo)
  frequency text, -- Ej: "3 veces al día", "Diario"
  notes text, -- Notas específicas para el paciente
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
  difficulty_rating integer check (difficulty_rating >= 1 and difficulty_rating <= 10), -- 1=muy fácil, 10=muy difícil
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
