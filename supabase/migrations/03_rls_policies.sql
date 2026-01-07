-- =====================================================
-- RLS Policies Script
-- Descripción: Elimina políticas antiguas e implementa
--              políticas granulares basadas en roles.
-- =====================================================

-- =====================================================
-- PASO 1: Eliminar políticas antiguas (demasiado permisivas)
-- =====================================================
drop policy if exists "Enable all access for authenticated users" on public.patients;
drop policy if exists "Enable all access for authenticated users" on public.appointments;
drop policy if exists "Enable all access for authenticated users" on public.sessions;
drop policy if exists "Enable all access for authenticated users" on public.payments;
drop policy if exists "Enable all access for authenticated users" on public.treatment_templates;
drop policy if exists "Enable all access for authenticated users" on public.template_techniques;
drop policy if exists "Enable all access for authenticated users" on public.patient_treatment_plans;
drop policy if exists "Enable all access for authenticated users" on public.exercise_library;
drop policy if exists "Enable all access for authenticated users" on public.patient_exercise_prescriptions;
drop policy if exists "Enable all access for authenticated users" on public.exercise_adherence_log;
drop policy if exists "Enable all access for authenticated users" on public.patient_medical_history;
drop policy if exists "Enable all access for authenticated users" on public.initial_assessments;
drop policy if exists "Enable all access for authenticated users" on public.patient_measurements;

-- =====================================================
-- PASO 2: Crear funciones Helper
-- =====================================================
create or replace function public.current_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.user_profiles where id = auth.uid()
$$;

create or replace function public.current_user_clinic()
returns uuid
language sql
security definer
stable
as $$
  select clinic_id from public.user_profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

create or replace function public.can_access_clinical_notes()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role in ('admin', 'therapist')
  )
$$;

-- =====================================================
-- PASO 3: Crear nuevas políticas RLS
-- =====================================================

-- RLS Policies: patients
alter table public.patients enable row level security;
create policy "Users can view patients from their clinic"
on public.patients for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist', 'receptionist')
);
create policy "Authorized users can create patients"
on public.patients for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist', 'receptionist')
);
create policy "Admin can update all patients"
on public.patients for update
using (
  clinic_id = current_user_clinic()
  and is_admin()
);
create policy "Therapists can update assigned patients"
on public.patients for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and (
    created_by = auth.uid()
    or id in (
      select distinct patient_id from appointments
      where therapist_id = auth.uid()
    )
  )
);
create policy "Only admin can delete patients"
on public.patients for delete
using (
  clinic_id = current_user_clinic()
  and is_admin()
);

-- RLS Policies: patient_medical_history
alter table public.patient_medical_history enable row level security;
create policy "Only clinical staff can view medical history"
on public.patient_medical_history for select
using (
  can_access_clinical_notes()
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);
create policy "Only clinical staff can modify medical history"
on public.patient_medical_history for insert
with check (
  can_access_clinical_notes()
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);
create policy "Only clinical staff can update medical history"
on public.patient_medical_history for update
using (
  can_access_clinical_notes()
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);

-- RLS Policies: appointments
alter table public.appointments enable row level security;
create policy "Admin and receptionist view all appointments"
on public.appointments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'receptionist')
);
create policy "Therapists view assigned appointments"
on public.appointments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and (therapist_id = auth.uid() or therapist_id is null)
);
create policy "Authorized users can create appointments"
on public.appointments for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist', 'receptionist')
);
create policy "Admin can update all appointments"
on public.appointments for update
using (
  clinic_id = current_user_clinic()
  and is_admin()
);
create policy "Therapists can update their appointments"
on public.appointments for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and therapist_id = auth.uid()
);
create policy "Receptionists can update appointments"
on public.appointments for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'receptionist'
);
create policy "Only admin can delete appointments"
on public.appointments for delete
using (
  clinic_id = current_user_clinic()
  and is_admin()
);

-- RLS Policies: sessions
alter table public.sessions enable row level security;
create policy "Only clinical staff can view sessions"
on public.sessions for select
using (
  can_access_clinical_notes()
  and appointment_id in (
    select id from appointments where clinic_id = current_user_clinic()
  )
);
create policy "Only clinical staff can create sessions"
on public.sessions for insert
with check (
  can_access_clinical_notes()
  and appointment_id in (
    select id from appointments where clinic_id = current_user_clinic()
  )
);
create policy "Therapists can update own sessions within 24h"
on public.sessions for update
using (
  can_access_clinical_notes()
  and created_by = auth.uid()
  and created_at > now() - interval '24 hours'
);
create policy "Admin can update all sessions"
on public.sessions for update
using (
  is_admin()
  and appointment_id in (
    select id from appointments where clinic_id = current_user_clinic()
  )
);

-- RLS Policies: payments
alter table public.payments enable row level security;
create policy "Admin and receptionist view all payments"
on public.payments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'receptionist')
);
create policy "Therapists view payments of their patients"
on public.payments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and patient_id in (
    select distinct patient_id from appointments
    where therapist_id = auth.uid()
  )
);
create policy "Authorized users can create payments"
on public.payments for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'receptionist')
);
create policy "Admin can update payments"
on public.payments for update
using (
  clinic_id = current_user_clinic()
  and is_admin()
);
create policy "Receptionist can update recent payments"
on public.payments for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'receptionist'
  and created_at > now() - interval '24 hours'
);

-- RLS Policies: exercise_library
alter table public.exercise_library enable row level security;
create policy "Clinical staff can view exercise library"
on public.exercise_library for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist')
);
create policy "Clinical staff can manage exercises"
on public.exercise_library for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist')
);
create policy "Clinical staff can update exercises"
on public.exercise_library for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist')
);

-- RLS Policies: patient_exercise_prescriptions
alter table public.patient_exercise_prescriptions enable row level security;
create policy "Clinical staff can view prescriptions"
on public.patient_exercise_prescriptions for select
using (
  patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
  and current_user_role() in ('admin', 'therapist')
);
create policy "Patients can view own prescriptions"
on public.patient_exercise_prescriptions for select
using (
  patient_id in (
    select id from patients
    where email = (select email from auth.users where id = auth.uid())
  )
);
create policy "Only clinical staff can prescribe exercises"
on public.patient_exercise_prescriptions for insert
with check (
  current_user_role() in ('admin', 'therapist')
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);
