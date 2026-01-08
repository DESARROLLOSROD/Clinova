-- ============================================================================
-- CLINOVA - Módulo de Registro de Auditoría (Audit Log)
-- ============================================================================

-- Tabla para el registro de acciones críticas
create table public.audit_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null, -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'SIGNATURE'
  entity_type text not null, -- 'patients', 'appointments', 'payments', etc.
  entity_id uuid, -- ID del registro afectado
  details jsonb, -- { old_data: {}, new_data: {}, ip: '', user_agent: '' }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table public.audit_log enable row level security;

-- Solo administradores pueden ver el log de auditoría
create policy "Only authenticated users can view audit log"
  on public.audit_log for select using (auth.role() = 'authenticated'); -- Se refinará con roles próximamente

-- Función genérica para triggers de auditoría
create or replace function public.process_audit_log()
returns trigger as $$
declare
  current_user_id uuid;
  audit_action text;
  old_data jsonb := null;
  new_data jsonb := null;
begin
  current_user_id := auth.uid();
  audit_action := TG_OP;

  if (TG_OP = 'DELETE') then
    old_data := to_jsonb(OLD);
  elsif (TG_OP = 'UPDATE') then
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  elsif (TG_OP = 'INSERT') then
    new_data := to_jsonb(NEW);
  end if;

  insert into public.audit_log (user_id, action, entity_type, entity_id, details)
  values (
    current_user_id,
    audit_action,
    TG_TABLE_NAME,
    case
      when TG_OP = 'DELETE' then OLD.id
      else NEW.id
    end,
    jsonb_build_object('old_data', old_data, 'new_data', new_data)
  );

  return null;
end;
$$ language plpgsql security definer;

-- Aplicar auditoría a tablas críticas
-- 1. Pacientes
create trigger audit_patients_trigger
after insert or update or delete on public.patients
for each row execute function public.process_audit_log();

-- 2. Citas
create trigger audit_appointments_trigger
after insert or update or delete on public.appointments
for each row execute function public.process_audit_log();

-- 3. Pagos
create trigger audit_payments_trigger
after insert or update or delete on public.payments
for each row execute function public.process_audit_log();

-- 4. Notas SOAP (Sesiones)
create trigger audit_sessions_trigger
after insert or update or delete on public.sessions
for each row execute function public.process_audit_log();

-- 5. Firmas de Consentimiento
create trigger audit_signatures_trigger
after insert or update or delete on public.patient_signatures
for each row execute function public.process_audit_log();

-- Índices
create index audit_log_user_id_idx on public.audit_log(user_id);
create index audit_log_entity_idx on public.audit_log(entity_type, entity_id);
create index audit_log_created_at_idx on public.audit_log(created_at desc);
create index audit_log_action_idx on public.audit_log(action);
