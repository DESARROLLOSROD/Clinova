-- ============================================================================
-- MEDICAL HISTORY MODULE
-- Módulo de Historial Médico del Paciente
-- ============================================================================

-- Crear tabla de historial médico del paciente
create table public.patient_medical_history (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  allergies text[], -- Alergias
  chronic_conditions text[], -- Condiciones crónicas
  current_medications text[], -- Medicamentos actuales
  previous_surgeries text[], -- Cirugías previas
  family_history text, -- Historial familiar
  lifestyle_notes text, -- Notas sobre estilo de vida (ejercicio, dieta, etc.)
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  blood_type text,
  height_cm decimal(5,2),
  weight_kg decimal(5,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Asegurar que solo haya un registro por paciente
  constraint unique_patient_medical_history unique (patient_id)
);

-- Crear tabla de evaluaciones iniciales
create table public.initial_assessments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  assessed_by uuid references auth.users(id) on delete set null,
  assessment_date date not null,
  chief_complaint text not null, -- Queja principal
  history_of_present_illness text, -- Historia de enfermedad actual
  pain_description text,
  pain_location text,
  pain_intensity integer check (pain_intensity >= 0 and pain_intensity <= 10),
  onset_date date,
  aggravating_factors text[],
  relieving_factors text[],
  functional_limitations text,
  previous_treatments text,
  assessment_findings text, -- Hallazgos de la evaluación
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
  measurement_type text not null, -- Tipo de medición: ROM, Fuerza, Balance, etc.
  body_part text, -- Parte del cuerpo medida
  measurement_value decimal(10,2),
  measurement_unit text, -- Unidad: grados, kg, cm, etc.
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
