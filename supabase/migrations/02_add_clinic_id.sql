-- =====================================================
-- Migración: Agregar clinic_id a tablas existentes
-- =====================================================

-- Nota: Estas migraciones deben ejecutarse en orden.
-- Después de ejecutar este script, se deben rellenar los datos de clinic_id
-- antes de establecer la columna como NOT NULL.

-- 1. Patients
alter table public.patients
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index patients_clinic_id_idx on public.patients(clinic_id);

-- 2. Appointments
alter table public.appointments
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index appointments_clinic_id_idx on public.appointments(clinic_id);

-- 3. Payments
-- Asumiendo que la tabla de pagos se llama 'payments'
alter table public.payments
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index payments_clinic_id_idx on public.payments(clinic_id);

-- 4. Exercise Library
-- Asumiendo que la tabla de la biblioteca de ejercicios se llama 'exercise_library'
-- Si el nombre es diferente (ej. 'exercises'), este script necesitará ser ajustado.
alter table public.exercise_library
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index exercise_library_clinic_id_idx on public.exercise_library(clinic_id);

-- 5. Treatment Templates
-- Asumiendo que la tabla de plantillas de tratamiento se llama 'treatment_templates'
alter table public.treatment_templates
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index treatment_templates_clinic_id_idx on public.treatment_templates(clinic_id);

-- Nota: Otras tablas como sessions, medical_history, etc., heredarán el
-- clinic_id a través de sus relaciones con estas tablas principales
-- (ej. a través de patient_id o appointment_id) y no necesitan una
-- columna clinic_id directa.
