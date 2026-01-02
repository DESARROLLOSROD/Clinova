-- ============================================================================
-- TREATMENT TEMPLATES MODULE
-- Módulo de Plantillas de Tratamiento
-- ============================================================================

-- Crear tabla de plantillas de tratamiento
create table public.treatment_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  category text, -- Ej: "Dolor lumbar", "Rehabilitación de hombro", etc.
  duration_minutes integer, -- Duración estimada de la sesión
  frequency text, -- Ej: "2 veces por semana", "Diario"
  objectives text[], -- Array de objetivos del tratamiento
  contraindications text[], -- Array de contraindicaciones
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
  order_index integer default 0, -- Orden de ejecución
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
