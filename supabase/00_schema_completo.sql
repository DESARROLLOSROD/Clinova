-- ============================================================================
-- CLINOVA - SCHEMA COMPLETO DE BASE DE DATOS
-- ============================================================================
-- Sistema de gestión para clínicas de fisioterapia
-- Este archivo contiene todo el esquema necesario para configurar Clinova
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================================

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLA: clinics
-- Descripción: Clínicas registradas en la plataforma
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'MX',
  timezone TEXT DEFAULT 'America/Mexico_City',
  currency TEXT DEFAULT 'MXN',
  language TEXT DEFAULT 'es',
  business_hours JSONB DEFAULT '{
    "monday": {"open": "08:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
    "thursday": {"open": "08:00", "close": "18:00", "closed": false},
    "friday": {"open": "08:00", "close": "18:00", "closed": false},
    "saturday": {"open": "09:00", "close": "14:00", "closed": false},
    "sunday": {"open": "09:00", "close": "14:00", "closed": true}
  }'::JSONB,
  default_appointment_duration INTEGER DEFAULT 60,
  allow_online_booking BOOLEAN DEFAULT false,
  require_payment_upfront BOOLEAN DEFAULT false,
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'suspended')),
  trial_ends_at TIMESTAMPTZ,
  subscription_started_at TIMESTAMPTZ,
  max_users INTEGER DEFAULT 2,
  max_patients INTEGER DEFAULT 100,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS clinics_slug_idx ON public.clinics(slug);
CREATE INDEX IF NOT EXISTS clinics_subscription_status_idx ON public.clinics(subscription_status);
CREATE INDEX IF NOT EXISTS clinics_is_active_idx ON public.clinics(is_active);

COMMENT ON TABLE public.clinics IS 'Clínicas registradas en la plataforma';

DROP TRIGGER IF EXISTS update_clinics_updated_at ON public.clinics;
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: user_profiles
-- Descripción: Perfiles de usuario con rol y clínica
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'therapist', 'receptionist', 'patient')),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  professional_title TEXT,
  phone TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{
    "notifications_enabled": true,
    "email_reminders": true,
    "sms_reminders": false,
    "language": "es",
    "theme": "light"
  }'::JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS user_profiles_clinic_id_idx ON public.user_profiles(clinic_id);
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS user_profiles_is_active_idx ON public.user_profiles(is_active);

COMMENT ON TABLE public.user_profiles IS 'Perfiles de usuario con rol y clínica';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: therapists
-- Descripción: Información de fisioterapeutas
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.therapists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialty TEXT,
  license_number TEXT,
  bio TEXT,
  avatar_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS therapists_auth_user_id_idx ON public.therapists(auth_user_id);
CREATE INDEX IF NOT EXISTS therapists_clinic_id_idx ON public.therapists(clinic_id);
CREATE INDEX IF NOT EXISTS therapists_is_active_idx ON public.therapists(is_active);

DROP TRIGGER IF EXISTS update_therapists_updated_at ON public.therapists;
CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON public.therapists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: patients
-- Descripción: Información de pacientes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  medical_history TEXT,
  notes TEXT,
  primary_therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS patients_clinic_id_idx ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS patients_auth_user_id_idx ON public.patients(auth_user_id);
CREATE INDEX IF NOT EXISTS patients_primary_therapist_id_idx ON public.patients(primary_therapist_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_email_unique ON public.patients(email) WHERE email IS NOT NULL;

DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: appointments
-- Descripción: Citas programadas
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  title TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS appointments_clinic_id_idx ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS appointments_patient_id_idx ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS appointments_therapist_id_idx ON public.appointments(therapist_id);
CREATE INDEX IF NOT EXISTS appointments_start_time_idx ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON public.appointments(status);

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: sessions
-- Descripción: Sesiones de fisioterapia (formato SOAP)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_appointment_id_idx ON public.sessions(appointment_id);

DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: payments
-- Descripción: Pagos de pacientes
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer', 'insurance');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  method payment_method NOT NULL,
  status payment_status DEFAULT 'completed',
  description TEXT,
  invoice_number TEXT,
  payment_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS payments_clinic_id_idx ON public.payments(clinic_id);
CREATE INDEX IF NOT EXISTS payments_patient_id_idx ON public.payments(patient_id);
CREATE INDEX IF NOT EXISTS payments_session_id_idx ON public.payments(session_id);
CREATE INDEX IF NOT EXISTS payments_payment_date_idx ON public.payments(payment_date DESC);

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: treatment_templates
-- Descripción: Plantillas de tratamiento reutilizables
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.treatment_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_minutes INTEGER,
  frequency TEXT,
  objectives TEXT[],
  contraindications TEXT[],
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS treatment_templates_clinic_id_idx ON public.treatment_templates(clinic_id);
CREATE INDEX IF NOT EXISTS treatment_templates_category_idx ON public.treatment_templates(category);
CREATE INDEX IF NOT EXISTS treatment_templates_is_active_idx ON public.treatment_templates(is_active);

DROP TRIGGER IF EXISTS update_treatment_templates_updated_at ON public.treatment_templates;
CREATE TRIGGER update_treatment_templates_updated_at
  BEFORE UPDATE ON public.treatment_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: template_techniques
-- Descripción: Técnicas dentro de plantillas de tratamiento
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.template_techniques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.treatment_templates(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS template_techniques_template_id_idx ON public.template_techniques(template_id);

-- ============================================================================
-- TABLA: patient_treatment_plans
-- Descripción: Planes de tratamiento asignados a pacientes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patient_treatment_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.treatment_templates(id) ON DELETE SET NULL,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  goals TEXT,
  progress_notes TEXT,
  sessions_planned INTEGER,
  sessions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS patient_treatment_plans_patient_id_idx ON public.patient_treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS patient_treatment_plans_status_idx ON public.patient_treatment_plans(status);

DROP TRIGGER IF EXISTS update_patient_treatment_plans_updated_at ON public.patient_treatment_plans;
CREATE TRIGGER update_patient_treatment_plans_updated_at
  BEFORE UPDATE ON public.patient_treatment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: exercise_library
-- Descripción: Biblioteca de ejercicios disponibles
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.exercise_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  body_part TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  equipment_needed TEXT[],
  instructions TEXT,
  video_url TEXT,
  image_url TEXT,
  contraindications TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS exercise_library_clinic_id_idx ON public.exercise_library(clinic_id);
CREATE INDEX IF NOT EXISTS exercise_library_category_idx ON public.exercise_library(category);
CREATE INDEX IF NOT EXISTS exercise_library_body_part_idx ON public.exercise_library(body_part);
CREATE INDEX IF NOT EXISTS exercise_library_is_active_idx ON public.exercise_library(is_active);

DROP TRIGGER IF EXISTS update_exercise_library_updated_at ON public.exercise_library;
CREATE TRIGGER update_exercise_library_updated_at
  BEFORE UPDATE ON public.exercise_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: patient_exercise_prescriptions
-- Descripción: Ejercicios prescritos a pacientes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patient_exercise_prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercise_library(id) ON DELETE SET NULL,
  prescribed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  sets INTEGER,
  repetitions INTEGER,
  duration_seconds INTEGER,
  frequency TEXT,
  notes TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS patient_exercise_prescriptions_patient_id_idx ON public.patient_exercise_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS patient_exercise_prescriptions_status_idx ON public.patient_exercise_prescriptions(status);

DROP TRIGGER IF EXISTS update_patient_exercise_prescriptions_updated_at ON public.patient_exercise_prescriptions;
CREATE TRIGGER update_patient_exercise_prescriptions_updated_at
  BEFORE UPDATE ON public.patient_exercise_prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: exercise_adherence_log
-- Descripción: Seguimiento de adherencia a ejercicios
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.exercise_adherence_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID REFERENCES public.patient_exercise_prescriptions(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE NOT NULL,
  sets_completed INTEGER,
  repetitions_completed INTEGER,
  duration_seconds INTEGER,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS exercise_adherence_log_prescription_id_idx ON public.exercise_adherence_log(prescription_id);
CREATE INDEX IF NOT EXISTS exercise_adherence_log_completed_date_idx ON public.exercise_adherence_log(completed_date DESC);

-- ============================================================================
-- TABLA: patient_medical_history
-- Descripción: Historial médico de pacientes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patient_medical_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  allergies TEXT[],
  chronic_conditions TEXT[],
  current_medications TEXT[],
  previous_surgeries TEXT[],
  family_history TEXT,
  lifestyle_notes TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  blood_type TEXT,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_patient_medical_history UNIQUE (patient_id)
);

CREATE INDEX IF NOT EXISTS patient_medical_history_patient_id_idx ON public.patient_medical_history(patient_id);

DROP TRIGGER IF EXISTS update_patient_medical_history_updated_at ON public.patient_medical_history;
CREATE TRIGGER update_patient_medical_history_updated_at
  BEFORE UPDATE ON public.patient_medical_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: initial_assessments
-- Descripción: Evaluaciones iniciales de pacientes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.initial_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  assessed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assessment_date DATE NOT NULL,
  chief_complaint TEXT NOT NULL,
  history_of_present_illness TEXT,
  pain_description TEXT,
  pain_location TEXT,
  pain_intensity INTEGER CHECK (pain_intensity >= 0 AND pain_intensity <= 10),
  onset_date DATE,
  aggravating_factors TEXT[],
  relieving_factors TEXT[],
  functional_limitations TEXT,
  previous_treatments TEXT,
  assessment_findings TEXT,
  diagnosis TEXT,
  treatment_goals TEXT[],
  recommended_treatment_plan TEXT,
  prognosis TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS initial_assessments_patient_id_idx ON public.initial_assessments(patient_id);
CREATE INDEX IF NOT EXISTS initial_assessments_assessment_date_idx ON public.initial_assessments(assessment_date DESC);

DROP TRIGGER IF EXISTS update_initial_assessments_updated_at ON public.initial_assessments;
CREATE TRIGGER update_initial_assessments_updated_at
  BEFORE UPDATE ON public.initial_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: patient_measurements
-- Descripción: Mediciones y valoraciones de pacientes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.patient_measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  measured_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  measurement_date DATE NOT NULL,
  measurement_type TEXT NOT NULL,
  body_part TEXT,
  measurement_value DECIMAL(10,2),
  measurement_unit TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS patient_measurements_patient_id_idx ON public.patient_measurements(patient_id);
CREATE INDEX IF NOT EXISTS patient_measurements_session_id_idx ON public.patient_measurements(session_id);
CREATE INDEX IF NOT EXISTS patient_measurements_measurement_date_idx ON public.patient_measurements(measurement_date DESC);

-- ============================================================================
-- TABLA: therapist_patient_assignments
-- Descripción: Asignación de terapeutas a pacientes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.therapist_patient_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(therapist_id, patient_id)
);

CREATE INDEX IF NOT EXISTS therapist_patient_assignments_therapist_id_idx ON public.therapist_patient_assignments(therapist_id);
CREATE INDEX IF NOT EXISTS therapist_patient_assignments_patient_id_idx ON public.therapist_patient_assignments(patient_id);

-- ============================================================================
-- FUNCIONES DE UTILIDAD
-- ============================================================================

-- Función para obtener el clinic_id del usuario actual
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT clinic_id
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_exercise_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_adherence_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initial_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_patient_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS: clinics
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own clinic" ON public.clinics;
CREATE POLICY "Users can view their own clinic"
ON public.clinics FOR SELECT
USING (id = get_user_clinic_id());

DROP POLICY IF EXISTS "Admins can update their clinic" ON public.clinics;
CREATE POLICY "Admins can update their clinic"
ON public.clinics FOR UPDATE
USING (id = get_user_clinic_id() AND current_user_role() = 'admin');

-- ============================================================================
-- POLÍTICAS RLS: user_profiles
-- ============================================================================

DROP POLICY IF EXISTS "Users can view profiles from their clinic" ON public.user_profiles;
CREATE POLICY "Users can view profiles from their clinic"
ON public.user_profiles FOR SELECT
USING (clinic_id = get_user_clinic_id());

DROP POLICY IF EXISTS "Admins can insert user profiles" ON public.user_profiles;
CREATE POLICY "Admins can insert user profiles"
ON public.user_profiles FOR INSERT
WITH CHECK (clinic_id = get_user_clinic_id() AND is_admin());

DROP POLICY IF EXISTS "Admins can update user profiles" ON public.user_profiles;
CREATE POLICY "Admins can update user profiles"
ON public.user_profiles FOR UPDATE
USING (clinic_id = get_user_clinic_id() AND is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (id = auth.uid());

-- ============================================================================
-- POLÍTICAS RLS: therapists
-- ============================================================================

DROP POLICY IF EXISTS "Users can view therapists from their clinic" ON public.therapists;
CREATE POLICY "Users can view therapists from their clinic"
ON public.therapists FOR SELECT
USING (clinic_id = get_user_clinic_id());

DROP POLICY IF EXISTS "Admins can manage therapists" ON public.therapists;
CREATE POLICY "Admins can manage therapists"
ON public.therapists FOR ALL
USING (clinic_id = get_user_clinic_id() AND current_user_role() = 'admin');

-- ============================================================================
-- POLÍTICAS RLS: patients
-- ============================================================================

DROP POLICY IF EXISTS "Users can view patients from their clinic" ON public.patients;
CREATE POLICY "Users can view patients from their clinic"
ON public.patients FOR SELECT
USING (clinic_id = get_user_clinic_id());

DROP POLICY IF EXISTS "Authorized users can create patients" ON public.patients;
CREATE POLICY "Authorized users can create patients"
ON public.patients FOR INSERT
WITH CHECK (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('admin', 'therapist', 'receptionist')
);

DROP POLICY IF EXISTS "Authorized users can update patients" ON public.patients;
CREATE POLICY "Authorized users can update patients"
ON public.patients FOR UPDATE
USING (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('admin', 'therapist', 'receptionist')
);

DROP POLICY IF EXISTS "Only admins can delete patients" ON public.patients;
CREATE POLICY "Only admins can delete patients"
ON public.patients FOR DELETE
USING (clinic_id = get_user_clinic_id() AND current_user_role() = 'admin');

-- ============================================================================
-- POLÍTICAS RLS: appointments
-- ============================================================================

DROP POLICY IF EXISTS "Users can view appointments from their clinic" ON public.appointments;
CREATE POLICY "Users can view appointments from their clinic"
ON public.appointments FOR SELECT
USING (clinic_id = get_user_clinic_id());

DROP POLICY IF EXISTS "Authorized users can manage appointments" ON public.appointments;
CREATE POLICY "Authorized users can manage appointments"
ON public.appointments FOR ALL
USING (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('admin', 'therapist', 'receptionist')
);

-- ============================================================================
-- POLÍTICAS RLS: sessions, payments, templates, exercises
-- ============================================================================

-- Sessions
DROP POLICY IF EXISTS "Users can view sessions from their clinic" ON public.sessions;
CREATE POLICY "Users can view sessions from their clinic"
ON public.sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_id AND a.clinic_id = get_user_clinic_id()
  )
);

DROP POLICY IF EXISTS "Authorized users can manage sessions" ON public.sessions;
CREATE POLICY "Authorized users can manage sessions"
ON public.sessions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_id AND a.clinic_id = get_user_clinic_id()
  )
  AND current_user_role() IN ('admin', 'therapist')
);

-- Payments
DROP POLICY IF EXISTS "Users can view payments from their clinic" ON public.payments;
CREATE POLICY "Users can view payments from their clinic"
ON public.payments FOR SELECT
USING (clinic_id = get_user_clinic_id());

DROP POLICY IF EXISTS "Authorized users can manage payments" ON public.payments;
CREATE POLICY "Authorized users can manage payments"
ON public.payments FOR ALL
USING (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('admin', 'therapist', 'receptionist')
);

-- Treatment Templates
DROP POLICY IF EXISTS "Users can view templates from their clinic" ON public.treatment_templates;
CREATE POLICY "Users can view templates from their clinic"
ON public.treatment_templates FOR SELECT
USING (clinic_id = get_user_clinic_id());

DROP POLICY IF EXISTS "Authorized users can manage templates" ON public.treatment_templates;
CREATE POLICY "Authorized users can manage templates"
ON public.treatment_templates FOR ALL
USING (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('admin', 'therapist')
);

-- Exercise Library
DROP POLICY IF EXISTS "Users can view exercises" ON public.exercise_library;
CREATE POLICY "Users can view exercises"
ON public.exercise_library FOR SELECT
USING (clinic_id = get_user_clinic_id() OR clinic_id IS NULL);

DROP POLICY IF EXISTS "Authorized users can manage exercises" ON public.exercise_library;
CREATE POLICY "Authorized users can manage exercises"
ON public.exercise_library FOR ALL
USING (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('admin', 'therapist')
);

-- Políticas generales para tablas relacionadas
DROP POLICY IF EXISTS "Users can access related data from their clinic" ON public.template_techniques;
CREATE POLICY "Users can access related data from their clinic"
ON public.template_techniques FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.treatment_templates t
    WHERE t.id = template_id AND t.clinic_id = get_user_clinic_id()
  )
);

DROP POLICY IF EXISTS "Users can access patient treatment plans" ON public.patient_treatment_plans;
CREATE POLICY "Users can access patient treatment plans"
ON public.patient_treatment_plans FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  )
);

DROP POLICY IF EXISTS "Users can access patient prescriptions" ON public.patient_exercise_prescriptions;
CREATE POLICY "Users can access patient prescriptions"
ON public.patient_exercise_prescriptions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  )
);

DROP POLICY IF EXISTS "Users can access adherence logs" ON public.exercise_adherence_log;
CREATE POLICY "Users can access adherence logs"
ON public.exercise_adherence_log FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patient_exercise_prescriptions pep
    JOIN public.patients p ON p.id = pep.patient_id
    WHERE pep.id = prescription_id AND p.clinic_id = get_user_clinic_id()
  )
);

DROP POLICY IF EXISTS "Users can access patient medical history" ON public.patient_medical_history;
CREATE POLICY "Users can access patient medical history"
ON public.patient_medical_history FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  )
);

DROP POLICY IF EXISTS "Users can access initial assessments" ON public.initial_assessments;
CREATE POLICY "Users can access initial assessments"
ON public.initial_assessments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  )
);

DROP POLICY IF EXISTS "Users can access patient measurements" ON public.patient_measurements;
CREATE POLICY "Users can access patient measurements"
ON public.patient_measurements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  )
);

DROP POLICY IF EXISTS "Users can access therapist assignments" ON public.therapist_patient_assignments;
CREATE POLICY "Users can access therapist assignments"
ON public.therapist_patient_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.therapists t
    WHERE t.id = therapist_id AND t.clinic_id = get_user_clinic_id()
  )
);

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ¡Schema de Clinova creado exitosamente!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Tablas principales creadas:';
    RAISE NOTICE '   - clinics';
    RAISE NOTICE '   - user_profiles';
    RAISE NOTICE '   - therapists';
    RAISE NOTICE '   - patients';
    RAISE NOTICE '   - appointments';
    RAISE NOTICE '   - sessions';
    RAISE NOTICE '   - payments';
    RAISE NOTICE '   - treatment_templates';
    RAISE NOTICE '   - exercise_library';
    RAISE NOTICE '   - patient_medical_history';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Row Level Security (RLS) habilitado en todas las tablas';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Siguiente paso: Crear tu primera clínica y usuario administrador';
    RAISE NOTICE '   Usa el archivo: 01_create_admin.sql';
    RAISE NOTICE '';
END $$;
