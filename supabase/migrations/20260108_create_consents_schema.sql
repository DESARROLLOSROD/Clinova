-- ============================================================================
-- CLINOVA - Módulo de Consentimientos Informados y Firma Digital
-- ============================================================================

-- Tabla para plantillas de documentos legales/consentimientos
create table public.consent_templates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null, -- Soporta Markdown o texto enriquecido
  description text,
  is_active boolean default true,
  category text, -- ej: 'Tratamiento', 'Protección de Datos', 'Punción Seca'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null
);

-- Tabla para el registro de firmas de pacientes
create table public.patient_signatures (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  consent_template_id uuid references public.consent_templates(id) on delete set null,
  signature_image_url text, -- Puede ser una URL a Storage o el blob Base64 (preferible storage para archivos grandes)
  signed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ip_address text, -- Captura de IP para validez legal
  user_agent text, -- Navegador/dispositivo
  witness_name text, -- Opcional: Nombre de un testigo o el fisioterapeuta
  notes text,
  is_valid boolean default true, -- Para revocar consentimientos si fuera necesario
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.consent_templates enable row level security;
alter table public.patient_signatures enable row level security;

-- Políticas para consent_templates
create policy "Enable all access for authenticated users to view templates"
  on public.consent_templates for select using (auth.role() = 'authenticated');

create policy "Enable insert/update for admins"
  on public.consent_templates for all
  using (auth.role() = 'authenticated'); -- Simplificado por ahora, se ajustará en la fase de roles

-- Políticas para patient_signatures
create policy "Users can view signatures from their clinic"
  on public.patient_signatures for select using (auth.role() = 'authenticated');

create policy "Users can insert signatures"
  on public.patient_signatures for insert with check (auth.role() = 'authenticated');

-- Índices
create index consent_templates_category_idx on public.consent_templates(category);
create index patient_signatures_patient_id_idx on public.patient_signatures(patient_id);
create index patient_signatures_signed_at_idx on public.patient_signatures(signed_at desc);

-- Insertar algunas plantillas de ejemplo
insert into public.consent_templates (title, category, content) values
('Consentimiento de Tratamiento General', 'Tratamiento', 'Doy mi consentimiento para recibir tratamiento de fisioterapia. Entiendo que los objetivos y riesgos me serán explicados por mi terapeuta...'),
('Consentimiento de Punción Seca', 'Tratamiento Especial', 'La punción seca es una técnica invasiva... Entiendo los riesgos de hematomas o dolor post-punción...'),
('Aviso de Privacidad y Protección de Datos', 'Legal', 'En cumplimiento con la ley de protección de datos, sus datos personales serán tratados con la máxima confidencialidad...');
