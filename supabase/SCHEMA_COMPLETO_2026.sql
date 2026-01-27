-- ============================================================================
-- CLINOVA - ESQUEMA COMPLETO DE BASE DE DATOS
-- ============================================================================
-- Sistema de gestion para clinicas de fisioterapia
-- Fecha: Enero 2026
--
-- INSTRUCCIONES:
-- 1. Ejecutar este archivo completo en Supabase Dashboard -> SQL Editor
-- 2. Despues de ejecutar, crear el usuario admin con el archivo 01_create_admin.sql
-- ============================================================================

-- ============================================================================
-- SECCION 1: FUNCIONES AUXILIARES
-- ============================================================================

-- Funcion para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECCION 2: TIPOS ENUM
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

-- ============================================================================
-- SECCION 3: TABLAS PRINCIPALES
-- ============================================================================

-- ----------------------------------------
-- Tabla: clinics
-- Descripcion: Clinicas registradas en la plataforma
-- ----------------------------------------
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
  next_payment_date DATE,
  max_users INTEGER DEFAULT 2,
  max_patients INTEGER DEFAULT 100,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS clinics_slug_idx ON public.clinics(slug);
CREATE INDEX IF NOT EXISTS clinics_subscription_status_idx ON public.clinics(subscription_status);
CREATE INDEX IF NOT EXISTS clinics_is_active_idx ON public.clinics(is_active);
CREATE INDEX IF NOT EXISTS idx_clinics_stripe_customer_id ON public.clinics(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clinics_stripe_subscription_id ON public.clinics(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

COMMENT ON TABLE public.clinics IS 'Clinicas registradas en la plataforma';

DROP TRIGGER IF EXISTS update_clinics_updated_at ON public.clinics;
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------
-- Tabla: user_profiles
-- Descripcion: Perfiles de usuario con rol y clinica
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'clinic_manager', 'therapist', 'receptionist', 'patient')),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
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

COMMENT ON TABLE public.user_profiles IS 'Perfiles de usuario con rol y clinica';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------
-- Tabla: therapists
-- Descripcion: Informacion de fisioterapeutas
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: patients
-- Descripcion: Informacion de pacientes
-- ----------------------------------------
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
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
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

-- ----------------------------------------
-- Tabla: appointments
-- Descripcion: Citas programadas
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: sessions
-- Descripcion: Sesiones de fisioterapia (formato SOAP)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_appointment_id_idx ON public.sessions(appointment_id);

DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------
-- Tabla: payments
-- Descripcion: Pagos de pacientes
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: treatment_templates
-- Descripcion: Plantillas de tratamiento reutilizables
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: template_techniques
-- Descripcion: Tecnicas dentro de plantillas de tratamiento
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: patient_treatment_plans
-- Descripcion: Planes de tratamiento asignados a pacientes
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: exercise_library
-- Descripcion: Biblioteca de ejercicios disponibles
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.exercise_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  body_part TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'easy', 'medium', 'hard')),
  equipment_needed TEXT[],
  instructions TEXT,
  video_url TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
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

-- ----------------------------------------
-- Tabla: patient_exercise_prescriptions
-- Descripcion: Ejercicios prescritos a pacientes
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: exercise_adherence_log
-- Descripcion: Seguimiento de adherencia a ejercicios
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: patient_medical_history
-- Descripcion: Historial medico de pacientes
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: initial_assessments
-- Descripcion: Evaluaciones iniciales de pacientes
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: patient_measurements
-- Descripcion: Mediciones y valoraciones de pacientes
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: therapist_patient_assignments
-- Descripcion: Asignacion de terapeutas a pacientes
-- ----------------------------------------
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

-- ----------------------------------------
-- Tabla: consent_templates
-- Descripcion: Plantillas de consentimientos informados
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.consent_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS consent_templates_category_idx ON public.consent_templates(category);

-- ----------------------------------------
-- Tabla: patient_signatures
-- Descripcion: Firmas de pacientes en consentimientos
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  consent_template_id UUID REFERENCES public.consent_templates(id) ON DELETE SET NULL,
  signature_image_url TEXT,
  signed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  witness_name TEXT,
  notes TEXT,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS patient_signatures_patient_id_idx ON public.patient_signatures(patient_id);
CREATE INDEX IF NOT EXISTS patient_signatures_signed_at_idx ON public.patient_signatures(signed_at DESC);

-- ----------------------------------------
-- Tabla: session_body_marks
-- Descripcion: Marcas en mapa anatomico
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.session_body_marks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  x_pos DECIMAL(5,2) NOT NULL,
  y_pos DECIMAL(5,2) NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('front', 'back')),
  mark_type TEXT NOT NULL CHECK (mark_type IN ('pain', 'tension', 'inflammation', 'trigger_point', 'injury')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_body_marks_session ON public.session_body_marks(session_id);
CREATE INDEX IF NOT EXISTS idx_body_marks_patient ON public.session_body_marks(patient_id);

-- ----------------------------------------
-- Tabla: patient_prescriptions
-- Descripcion: Prescripciones de ejercicios para pacientes
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  therapist_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  general_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON public.patient_prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_therapist ON public.patient_prescriptions(therapist_id);

-- ----------------------------------------
-- Tabla: prescription_items
-- Descripcion: Items de prescripcion
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.prescription_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID REFERENCES public.patient_prescriptions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercise_library(id) ON DELETE CASCADE NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight TEXT,
  duration TEXT,
  frequency TEXT,
  specific_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prescription_items_parent ON public.prescription_items(prescription_id);

-- ----------------------------------------
-- Tabla: audit_log
-- Descripcion: Registro de auditoria
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_log_user_id_idx ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS audit_log_clinic_id_idx ON public.audit_log(clinic_id);
CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON public.audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_action_idx ON public.audit_log(action);

-- ----------------------------------------
-- Tabla: patient_documents
-- Descripcion: Documentos de pacientes (imagenes, PDFs)
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.initial_assessments(id) ON DELETE SET NULL,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes INTEGER,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  document_type TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS patient_documents_patient_id_idx ON public.patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS patient_documents_assessment_id_idx ON public.patient_documents(assessment_id);
CREATE INDEX IF NOT EXISTS patient_documents_clinic_id_idx ON public.patient_documents(clinic_id);
CREATE INDEX IF NOT EXISTS patient_documents_document_type_idx ON public.patient_documents(document_type);
CREATE INDEX IF NOT EXISTS patient_documents_created_at_idx ON public.patient_documents(created_at DESC);

DROP TRIGGER IF EXISTS update_patient_documents_updated_at ON public.patient_documents;
CREATE TRIGGER update_patient_documents_updated_at
  BEFORE UPDATE ON public.patient_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------
-- Tabla: subscription_plans
-- Descripcion: Planes de suscripcion
-- ----------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_name TEXT NOT NULL UNIQUE CHECK (plan_name IN ('basic', 'professional', 'enterprise')),
  display_name TEXT NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  yearly_price DECIMAL(10,2),
  currency TEXT DEFAULT 'MXN',
  max_users INTEGER NOT NULL DEFAULT 2,
  max_patients INTEGER NOT NULL DEFAULT 100,
  max_therapists INTEGER,
  max_storage_gb INTEGER DEFAULT 5,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS subscription_plans_plan_name_idx ON public.subscription_plans(plan_name);
CREATE INDEX IF NOT EXISTS subscription_plans_is_active_idx ON public.subscription_plans(is_active);

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECCION 4: FUNCIONES DE UTILIDAD
-- ============================================================================

-- Funcion para obtener el clinic_id del usuario actual
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT clinic_id
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Funcion para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Funcion para verificar si el usuario es super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'super_admin'
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Funcion para verificar si el usuario es clinic manager
CREATE OR REPLACE FUNCTION is_clinic_manager()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'clinic_manager'
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Funcion para verificar si el usuario es admin (super_admin o clinic_manager)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('super_admin', 'clinic_manager')
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Funcion para verificar acceso a notas clinicas
CREATE OR REPLACE FUNCTION can_access_clinical_notes()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('super_admin', 'clinic_manager', 'therapist')
        FROM public.user_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Funcion para auditoria
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id uuid;
  audit_action text;
  old_data jsonb := null;
  new_data jsonb := null;
BEGIN
  current_user_id := auth.uid();
  audit_action := TG_OP;

  IF (TG_OP = 'DELETE') THEN
    old_data := to_jsonb(OLD);
  ELSIF (TG_OP = 'UPDATE') THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF (TG_OP = 'INSERT') THEN
    new_data := to_jsonb(NEW);
  END IF;

  INSERT INTO public.audit_log (user_id, action, entity_type, entity_id, details)
  VALUES (
    current_user_id,
    audit_action,
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    jsonb_build_object('old_data', old_data, 'new_data', new_data)
  );

  RETURN null;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECCION 5: TRIGGERS DE AUDITORIA
-- ============================================================================

DROP TRIGGER IF EXISTS audit_patients_trigger ON public.patients;
CREATE TRIGGER audit_patients_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_appointments_trigger ON public.appointments;
CREATE TRIGGER audit_appointments_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_payments_trigger ON public.payments;
CREATE TRIGGER audit_payments_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_sessions_trigger ON public.sessions;
CREATE TRIGGER audit_sessions_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_signatures_trigger ON public.patient_signatures;
CREATE TRIGGER audit_signatures_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.patient_signatures
FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

-- ============================================================================
-- SECCION 6: HABILITAR ROW LEVEL SECURITY (RLS)
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
ALTER TABLE public.consent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_body_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECCION 7: POLITICAS RLS
-- ============================================================================

-- ----------------------------------------
-- Politicas: clinics
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view their own clinic" ON public.clinics;
CREATE POLICY "Users can view their own clinic"
ON public.clinics FOR SELECT
USING (id = get_user_clinic_id() OR is_super_admin());

DROP POLICY IF EXISTS "Super admin can view all clinics" ON public.clinics;
CREATE POLICY "Super admin can view all clinics"
ON public.clinics FOR SELECT
USING (is_super_admin());

DROP POLICY IF EXISTS "Super admin can create clinics" ON public.clinics;
CREATE POLICY "Super admin can create clinics"
ON public.clinics FOR INSERT
WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Super admin can update all clinics" ON public.clinics;
CREATE POLICY "Super admin can update all clinics"
ON public.clinics FOR UPDATE
USING (is_super_admin());

DROP POLICY IF EXISTS "Clinic managers can update their clinic" ON public.clinics;
CREATE POLICY "Clinic managers can update their clinic"
ON public.clinics FOR UPDATE
USING (id = get_user_clinic_id() AND is_clinic_manager());

DROP POLICY IF EXISTS "Super admin can delete clinics" ON public.clinics;
CREATE POLICY "Super admin can delete clinics"
ON public.clinics FOR DELETE
USING (is_super_admin());

-- ----------------------------------------
-- Politicas: user_profiles
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view profiles from their clinic" ON public.user_profiles;
CREATE POLICY "Users can view profiles from their clinic"
ON public.user_profiles FOR SELECT
USING (clinic_id = get_user_clinic_id() OR id = auth.uid());

DROP POLICY IF EXISTS "Super admin can view all profiles" ON public.user_profiles;
CREATE POLICY "Super admin can view all profiles"
ON public.user_profiles FOR SELECT
USING (is_super_admin());

DROP POLICY IF EXISTS "Super admin can create profiles" ON public.user_profiles;
CREATE POLICY "Super admin can create profiles"
ON public.user_profiles FOR INSERT
WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "Clinic managers can insert user profiles" ON public.user_profiles;
CREATE POLICY "Clinic managers can insert user profiles"
ON public.user_profiles FOR INSERT
WITH CHECK (clinic_id = get_user_clinic_id() AND is_clinic_manager());

DROP POLICY IF EXISTS "Super admin can update profiles" ON public.user_profiles;
CREATE POLICY "Super admin can update profiles"
ON public.user_profiles FOR UPDATE
USING (is_super_admin());

DROP POLICY IF EXISTS "Clinic managers can update user profiles" ON public.user_profiles;
CREATE POLICY "Clinic managers can update user profiles"
ON public.user_profiles FOR UPDATE
USING (clinic_id = get_user_clinic_id() AND is_clinic_manager());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (id = auth.uid());

-- ----------------------------------------
-- Politicas: therapists
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view therapists from their clinic" ON public.therapists;
CREATE POLICY "Users can view therapists from their clinic"
ON public.therapists FOR SELECT
USING (clinic_id = get_user_clinic_id() OR is_super_admin());

DROP POLICY IF EXISTS "Admins can manage therapists" ON public.therapists;
CREATE POLICY "Admins can manage therapists"
ON public.therapists FOR ALL
USING (clinic_id = get_user_clinic_id() AND is_admin());

-- ----------------------------------------
-- Politicas: patients
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view patients from their clinic" ON public.patients;
CREATE POLICY "Users can view patients from their clinic"
ON public.patients FOR SELECT
USING (clinic_id = get_user_clinic_id() OR is_super_admin());

DROP POLICY IF EXISTS "Authorized users can create patients" ON public.patients;
CREATE POLICY "Authorized users can create patients"
ON public.patients FOR INSERT
WITH CHECK (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('super_admin', 'clinic_manager', 'therapist', 'receptionist')
);

DROP POLICY IF EXISTS "Authorized users can update patients" ON public.patients;
CREATE POLICY "Authorized users can update patients"
ON public.patients FOR UPDATE
USING (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('super_admin', 'clinic_manager', 'therapist', 'receptionist')
);

DROP POLICY IF EXISTS "Only admins can delete patients" ON public.patients;
CREATE POLICY "Only admins can delete patients"
ON public.patients FOR DELETE
USING (clinic_id = get_user_clinic_id() AND is_admin());

DROP POLICY IF EXISTS "Super admin can manage all patients" ON public.patients;
CREATE POLICY "Super admin can manage all patients"
ON public.patients FOR ALL
USING (is_super_admin());

-- ----------------------------------------
-- Politicas: appointments
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view appointments from their clinic" ON public.appointments;
CREATE POLICY "Users can view appointments from their clinic"
ON public.appointments FOR SELECT
USING (clinic_id = get_user_clinic_id() OR is_super_admin());

DROP POLICY IF EXISTS "Authorized users can manage appointments" ON public.appointments;
CREATE POLICY "Authorized users can manage appointments"
ON public.appointments FOR ALL
USING (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('super_admin', 'clinic_manager', 'therapist', 'receptionist')
);

-- ----------------------------------------
-- Politicas: sessions
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view sessions from their clinic" ON public.sessions;
CREATE POLICY "Users can view sessions from their clinic"
ON public.sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_id AND a.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

DROP POLICY IF EXISTS "Authorized users can manage sessions" ON public.sessions;
CREATE POLICY "Authorized users can manage sessions"
ON public.sessions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_id AND a.clinic_id = get_user_clinic_id()
  )
  AND current_user_role() IN ('super_admin', 'clinic_manager', 'therapist')
);

-- ----------------------------------------
-- Politicas: payments
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view payments from their clinic" ON public.payments;
CREATE POLICY "Users can view payments from their clinic"
ON public.payments FOR SELECT
USING (clinic_id = get_user_clinic_id() OR is_super_admin());

DROP POLICY IF EXISTS "Authorized users can manage payments" ON public.payments;
CREATE POLICY "Authorized users can manage payments"
ON public.payments FOR ALL
USING (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('super_admin', 'clinic_manager', 'therapist', 'receptionist')
);

-- ----------------------------------------
-- Politicas: treatment_templates
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view templates from their clinic" ON public.treatment_templates;
CREATE POLICY "Users can view templates from their clinic"
ON public.treatment_templates FOR SELECT
USING (clinic_id = get_user_clinic_id() OR is_super_admin());

DROP POLICY IF EXISTS "Authorized users can manage templates" ON public.treatment_templates;
CREATE POLICY "Authorized users can manage templates"
ON public.treatment_templates FOR ALL
USING (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('super_admin', 'clinic_manager', 'therapist')
);

-- ----------------------------------------
-- Politicas: exercise_library
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view exercises" ON public.exercise_library;
CREATE POLICY "Users can view exercises"
ON public.exercise_library FOR SELECT
USING (clinic_id = get_user_clinic_id() OR clinic_id IS NULL OR is_super_admin());

DROP POLICY IF EXISTS "Authorized users can manage exercises" ON public.exercise_library;
CREATE POLICY "Authorized users can manage exercises"
ON public.exercise_library FOR ALL
USING (
  clinic_id = get_user_clinic_id()
  AND current_user_role() IN ('super_admin', 'clinic_manager', 'therapist')
);

-- ----------------------------------------
-- Politicas: template_techniques
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can access related data from their clinic" ON public.template_techniques;
CREATE POLICY "Users can access related data from their clinic"
ON public.template_techniques FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.treatment_templates t
    WHERE t.id = template_id AND t.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

-- ----------------------------------------
-- Politicas: patient_treatment_plans
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can access patient treatment plans" ON public.patient_treatment_plans;
CREATE POLICY "Users can access patient treatment plans"
ON public.patient_treatment_plans FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

-- ----------------------------------------
-- Politicas: patient_exercise_prescriptions
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can access patient prescriptions" ON public.patient_exercise_prescriptions;
CREATE POLICY "Users can access patient prescriptions"
ON public.patient_exercise_prescriptions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

-- ----------------------------------------
-- Politicas: exercise_adherence_log
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can access adherence logs" ON public.exercise_adherence_log;
CREATE POLICY "Users can access adherence logs"
ON public.exercise_adherence_log FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patient_exercise_prescriptions pep
    JOIN public.patients p ON p.id = pep.patient_id
    WHERE pep.id = prescription_id AND p.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

-- ----------------------------------------
-- Politicas: patient_medical_history
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can access patient medical history" ON public.patient_medical_history;
CREATE POLICY "Users can access patient medical history"
ON public.patient_medical_history FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  ) AND can_access_clinical_notes()
);

-- ----------------------------------------
-- Politicas: initial_assessments
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can access initial assessments" ON public.initial_assessments;
CREATE POLICY "Users can access initial assessments"
ON public.initial_assessments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

-- ----------------------------------------
-- Politicas: patient_measurements
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can access patient measurements" ON public.patient_measurements;
CREATE POLICY "Users can access patient measurements"
ON public.patient_measurements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

-- ----------------------------------------
-- Politicas: therapist_patient_assignments
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can access therapist assignments" ON public.therapist_patient_assignments;
CREATE POLICY "Users can access therapist assignments"
ON public.therapist_patient_assignments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.therapists t
    WHERE t.id = therapist_id AND t.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

-- ----------------------------------------
-- Politicas: consent_templates
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view consent templates" ON public.consent_templates;
CREATE POLICY "Users can view consent templates"
ON public.consent_templates FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage consent templates" ON public.consent_templates;
CREATE POLICY "Admins can manage consent templates"
ON public.consent_templates FOR ALL
USING (is_admin());

-- ----------------------------------------
-- Politicas: patient_signatures
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view signatures from their clinic" ON public.patient_signatures;
CREATE POLICY "Users can view signatures from their clinic"
ON public.patient_signatures FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

DROP POLICY IF EXISTS "Users can insert signatures" ON public.patient_signatures;
CREATE POLICY "Users can insert signatures"
ON public.patient_signatures FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- ----------------------------------------
-- Politicas: session_body_marks
-- ----------------------------------------
DROP POLICY IF EXISTS "Authenticated users can manage body marks" ON public.session_body_marks;
CREATE POLICY "Authenticated users can manage body marks"
ON public.session_body_marks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

-- ----------------------------------------
-- Politicas: patient_prescriptions
-- ----------------------------------------
DROP POLICY IF EXISTS "Authenticated users can manage prescriptions" ON public.patient_prescriptions;
CREATE POLICY "Authenticated users can manage prescriptions"
ON public.patient_prescriptions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = patient_id AND p.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

-- ----------------------------------------
-- Politicas: prescription_items
-- ----------------------------------------
DROP POLICY IF EXISTS "Authenticated users can manage prescription items" ON public.prescription_items;
CREATE POLICY "Authenticated users can manage prescription items"
ON public.prescription_items FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.patient_prescriptions pp
    JOIN public.patients p ON p.id = pp.patient_id
    WHERE pp.id = prescription_id AND p.clinic_id = get_user_clinic_id()
  ) OR is_super_admin()
);

-- ----------------------------------------
-- Politicas: audit_log
-- ----------------------------------------
DROP POLICY IF EXISTS "Only admins can view audit log" ON public.audit_log;
CREATE POLICY "Only admins can view audit log"
ON public.audit_log FOR SELECT
USING (is_admin() AND (clinic_id = get_user_clinic_id() OR is_super_admin()));

DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;
CREATE POLICY "System can insert audit log"
ON public.audit_log FOR INSERT
WITH CHECK (true);

-- ----------------------------------------
-- Politicas: patient_documents
-- ----------------------------------------
DROP POLICY IF EXISTS "Users can view documents from their clinic" ON public.patient_documents;
CREATE POLICY "Users can view documents from their clinic"
ON public.patient_documents FOR SELECT
USING (clinic_id = get_user_clinic_id() OR is_super_admin());

DROP POLICY IF EXISTS "Users can insert documents for their clinic patients" ON public.patient_documents;
CREATE POLICY "Users can insert documents for their clinic patients"
ON public.patient_documents FOR INSERT
WITH CHECK (clinic_id = get_user_clinic_id());

DROP POLICY IF EXISTS "Users can delete their uploaded documents" ON public.patient_documents;
CREATE POLICY "Users can delete their uploaded documents"
ON public.patient_documents FOR DELETE
USING (
  uploaded_by = auth.uid()
  OR is_admin()
);

-- ----------------------------------------
-- Politicas: subscription_plans
-- ----------------------------------------
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view active plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true AND is_visible = true);

DROP POLICY IF EXISTS "Only super admins can update plans" ON public.subscription_plans;
CREATE POLICY "Only super admins can update plans"
ON public.subscription_plans FOR UPDATE
USING (is_super_admin());

DROP POLICY IF EXISTS "Only super admins can insert plans" ON public.subscription_plans;
CREATE POLICY "Only super admins can insert plans"
ON public.subscription_plans FOR INSERT
WITH CHECK (is_super_admin());

-- ============================================================================
-- SECCION 8: DATOS INICIALES (SEED DATA)
-- ============================================================================

-- Plantillas de consentimiento
INSERT INTO public.consent_templates (title, category, content) VALUES
('Consentimiento de Tratamiento General', 'Tratamiento', 'Doy mi consentimiento para recibir tratamiento de fisioterapia. Entiendo que los objetivos y riesgos me seran explicados por mi terapeuta...'),
('Consentimiento de Puncion Seca', 'Tratamiento Especial', 'La puncion seca es una tecnica invasiva... Entiendo los riesgos de hematomas o dolor post-puncion...'),
('Aviso de Privacidad y Proteccion de Datos', 'Legal', 'En cumplimiento con la ley de proteccion de datos, sus datos personales seran tratados con la maxima confidencialidad...')
ON CONFLICT DO NOTHING;

-- Ejercicios de ejemplo
INSERT INTO public.exercise_library (name, category, body_part, difficulty, instructions, description, is_active)
VALUES
('Estiramiento de Isquiotibiales', 'Flexibilidad', 'Piernas', 'beginner', 'Sientate en el suelo con una pierna estirada y la otra doblada. Inclinate hacia adelante desde la cadera.', 'Estiramiento basico para la parte posterior del muslo.', true),
('Puente de Gluteo', 'Fortalecimiento', 'Core', 'beginner', 'Tumbarse boca arriba con las rodillas dobladas. Levanta la pelvis hacia el techo apretando los gluteos.', 'Ejercicio fundamental para estabilidad lumbopelvica.', true),
('Sentadilla de Pared', 'Fortalecimiento', 'Piernas', 'intermediate', 'Apoya la espalda en la pared y baja hasta que tus rodillas esten a 90 grados. Manten la posicion.', 'Fortalecimiento isometrico de cuadriceps.', true),
('Plancha Frontal', 'Estabilidad', 'Core', 'intermediate', 'Apoyate en los antebrazos y las puntas de los pies, manteniendo el cuerpo recto como una tabla.', 'Mejora la estabilidad del tronco y previene dolor de espalda.', true),
('Rotacion Cervical Suave', 'Movilidad', 'Cuello', 'beginner', 'Gira la cabeza lentamente hacia un lado y hacia el otro sin forzar el rango.', 'Alivio de tension en la zona cervical.', true),
('Gato-Camello', 'Movilidad', 'Espalda', 'beginner', 'En cuadrupedia, arquea la espalda hacia arriba (gato) y luego hacia abajo (camello).', 'Mejora la movilidad segmentaria de la columna.', true)
ON CONFLICT DO NOTHING;

-- Planes de suscripcion
INSERT INTO public.subscription_plans (plan_name, display_name, description, monthly_price, yearly_price, max_users, max_patients, max_therapists, max_storage_gb, features) VALUES
('basic', 'Basico', 'Perfecto para clinicas pequenas que estan comenzando', 499.00, 4990.00, 2, 50, 1, 5,
  '[
    "2 usuarios simultaneos",
    "Hasta 50 pacientes",
    "1 terapeuta",
    "5 GB de almacenamiento",
    "Agenda basica",
    "Notas SOAP",
    "Soporte por email"
  ]'::jsonb
),
('professional', 'Profesional', 'Para clinicas en crecimiento con multiples profesionales', 999.00, 9990.00, 10, 500, 5, 50,
  '[
    "10 usuarios simultaneos",
    "Hasta 500 pacientes",
    "5 terapeutas",
    "50 GB de almacenamiento",
    "Agenda avanzada",
    "Notas SOAP completas",
    "Plantillas de ejercicios",
    "Reportes basicos",
    "Soporte prioritario"
  ]'::jsonb
),
('enterprise', 'Enterprise', 'Para grandes clinicas con necesidades avanzadas', 2499.00, 24990.00, 999, 999999, 999, 500,
  '[
    "Usuarios ilimitados",
    "Pacientes ilimitados",
    "Terapeutas ilimitados",
    "500 GB de almacenamiento",
    "Agenda personalizable",
    "Notas SOAP completas",
    "Plantillas ilimitadas",
    "Reportes avanzados",
    "API access",
    "Branding personalizado",
    "Soporte 24/7",
    "Gerente de cuenta dedicado"
  ]'::jsonb
)
ON CONFLICT (plan_name) DO NOTHING;

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'CLINOVA - Schema creado exitosamente!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tablas principales creadas:';
    RAISE NOTICE '  - clinics';
    RAISE NOTICE '  - user_profiles';
    RAISE NOTICE '  - therapists';
    RAISE NOTICE '  - patients';
    RAISE NOTICE '  - appointments';
    RAISE NOTICE '  - sessions';
    RAISE NOTICE '  - payments';
    RAISE NOTICE '  - treatment_templates';
    RAISE NOTICE '  - exercise_library';
    RAISE NOTICE '  - patient_medical_history';
    RAISE NOTICE '  - consent_templates';
    RAISE NOTICE '  - patient_documents';
    RAISE NOTICE '  - subscription_plans';
    RAISE NOTICE '  - audit_log';
    RAISE NOTICE '';
    RAISE NOTICE 'Row Level Security (RLS) habilitado en todas las tablas';
    RAISE NOTICE '';
    RAISE NOTICE 'SIGUIENTE PASO:';
    RAISE NOTICE '1. Crear un usuario en Supabase Auth';
    RAISE NOTICE '2. Ejecutar el script para crear el perfil de admin';
    RAISE NOTICE '';
END $$;
