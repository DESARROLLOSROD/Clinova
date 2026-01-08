-- ============================================================================
-- CLINOVA - Módulo de Mapa Anatómico Interactivo
-- ============================================================================

-- Tabla para almacenar marcas en el mapa corporal
create table public.session_body_marks (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade not null,
  
  -- Coordenadas relativas (0-100) para que el mapa sea responsive
  x_pos decimal(5,2) not null,
  y_pos decimal(5,2) not null,
  
  -- Lado del cuerpo
  side text not null check (side in ('front', 'back')),
  
  -- Tipo de marca
  mark_type text not null check (mark_type in ('pain', 'tension', 'inflammation', 'trigger_point', 'injury')),
  
  -- Notas adicionales
  notes text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para búsqueda rápida
create index idx_body_marks_session on public.session_body_marks(session_id);
create index idx_body_marks_patient on public.session_body_marks(patient_id);

-- RLS
alter table public.session_body_marks enable row level security;

create policy "Authenticated users can manage body marks"
  on public.session_body_marks for all
  using (auth.role() = 'authenticated');
