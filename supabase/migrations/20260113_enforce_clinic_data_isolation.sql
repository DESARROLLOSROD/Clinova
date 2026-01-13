-- =====================================================
-- Migración: Garantizar Aislamiento de Datos por Clínica
-- =====================================================
-- Esta migración asegura que cada clínica solo pueda ver y gestionar
-- sus propios datos mediante políticas RLS (Row Level Security)
-- =====================================================

BEGIN;

-- =====================================================
-- PASO 1: Asegurar que clinic_id sea NOT NULL en tablas críticas
-- =====================================================

-- Primero, asignar una clínica por defecto a registros huérfanos (si existen)
-- SOLO SI HAY UNA ÚNICA CLÍNICA. De lo contrario, hay que hacerlo manualmente.

-- Verificar y actualizar pacientes huérfanos
DO $$
DECLARE
  default_clinic_id uuid;
  clinic_count integer;
BEGIN
  SELECT COUNT(*) INTO clinic_count FROM public.clinics;

  IF clinic_count = 1 THEN
    SELECT id INTO default_clinic_id FROM public.clinics LIMIT 1;

    UPDATE public.patients
    SET clinic_id = default_clinic_id
    WHERE clinic_id IS NULL;

    UPDATE public.appointments
    SET clinic_id = default_clinic_id
    WHERE clinic_id IS NULL;

    UPDATE public.payments
    SET clinic_id = default_clinic_id
    WHERE clinic_id IS NULL;

    UPDATE public.user_profiles
    SET clinic_id = default_clinic_id
    WHERE clinic_id IS NULL;
  END IF;
END $$;

-- Ahora hacer clinic_id NOT NULL para prevenir datos huérfanos en el futuro
ALTER TABLE public.patients
  ALTER COLUMN clinic_id SET NOT NULL;

ALTER TABLE public.appointments
  ALTER COLUMN clinic_id SET NOT NULL;

ALTER TABLE public.payments
  ALTER COLUMN clinic_id SET NOT NULL;

ALTER TABLE public.user_profiles
  ALTER COLUMN clinic_id SET NOT NULL;

-- =====================================================
-- PASO 2: Actualizar políticas RLS para todas las tablas relacionadas
-- =====================================================

-- -----------------------------------------------------
-- Tabla: patient_documents
-- -----------------------------------------------------
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view patient documents from their clinic" ON public.patient_documents;
DROP POLICY IF EXISTS "Users can insert patient documents" ON public.patient_documents;
DROP POLICY IF EXISTS "Users can update patient documents" ON public.patient_documents;
DROP POLICY IF EXISTS "Users can delete patient documents" ON public.patient_documents;

CREATE POLICY "Users can view patient documents from their clinic"
ON public.patient_documents FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Clinical staff can insert patient documents"
ON public.patient_documents FOR INSERT
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'therapist', 'receptionist')
    )
  )
);

CREATE POLICY "Clinical staff can update patient documents"
ON public.patient_documents FOR UPDATE
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'therapist', 'receptionist')
    )
  )
);

CREATE POLICY "Admins can delete patient documents"
ON public.patient_documents FOR DELETE
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'super_admin')
    )
  )
);

-- -----------------------------------------------------
-- Tabla: body_map_annotations
-- -----------------------------------------------------
ALTER TABLE public.body_map_annotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view body map annotations" ON public.body_map_annotations;
DROP POLICY IF EXISTS "Clinical staff can manage body map annotations" ON public.body_map_annotations;

CREATE POLICY "Users can view body map annotations from their clinic"
ON public.body_map_annotations FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Clinical staff can manage body map annotations"
ON public.body_map_annotations FOR ALL
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'therapist')
    )
  )
)
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'therapist')
    )
  )
);

-- -----------------------------------------------------
-- Tabla: patient_consents
-- -----------------------------------------------------
ALTER TABLE public.patient_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view patient consents" ON public.patient_consents;
DROP POLICY IF EXISTS "Clinical staff can manage consents" ON public.patient_consents;

CREATE POLICY "Users can view patient consents from their clinic"
ON public.patient_consents FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Clinical staff can manage patient consents"
ON public.patient_consents FOR ALL
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'therapist', 'receptionist')
    )
  )
)
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'therapist', 'receptionist')
    )
  )
);

-- -----------------------------------------------------
-- Tabla: patient_exercises
-- -----------------------------------------------------
ALTER TABLE public.patient_exercises ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view patient exercises" ON public.patient_exercises;
DROP POLICY IF EXISTS "Clinical staff can manage patient exercises" ON public.patient_exercises;

CREATE POLICY "Users can view patient exercises from their clinic"
ON public.patient_exercises FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Clinical staff can manage patient exercises"
ON public.patient_exercises FOR ALL
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'therapist')
    )
  )
)
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'therapist')
    )
  )
);

-- -----------------------------------------------------
-- Tabla: exercise_templates
-- -----------------------------------------------------
ALTER TABLE public.exercise_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view exercise templates" ON public.exercise_templates;
DROP POLICY IF EXISTS "Clinical staff can manage exercise templates" ON public.exercise_templates;

CREATE POLICY "Users can view exercise templates from their clinic"
ON public.exercise_templates FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Clinical staff can manage exercise templates"
ON public.exercise_templates FOR ALL
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('clinic_manager', 'admin', 'therapist')
  )
)
WITH CHECK (
  clinic_id IN (
    SELECT clinic_id FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('clinic_manager', 'admin', 'therapist')
  )
);

-- -----------------------------------------------------
-- Tabla: sessions (verificar aislamiento)
-- -----------------------------------------------------
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only clinical staff can view sessions" ON public.sessions;
DROP POLICY IF EXISTS "Only clinical staff can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Therapists can update own sessions within 24h" ON public.sessions;
DROP POLICY IF EXISTS "Admin can update all sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can view sessions from their clinic" ON public.sessions;
DROP POLICY IF EXISTS "Clinical staff can manage sessions" ON public.sessions;

CREATE POLICY "Users can view sessions from their clinic"
ON public.sessions FOR SELECT
USING (
  appointment_id IN (
    SELECT id FROM public.appointments
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Clinical staff can create sessions"
ON public.sessions FOR INSERT
WITH CHECK (
  appointment_id IN (
    SELECT id FROM public.appointments
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'therapist')
    )
  )
);

CREATE POLICY "Clinical staff can update sessions"
ON public.sessions FOR UPDATE
USING (
  appointment_id IN (
    SELECT id FROM public.appointments
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'therapist')
    )
  )
);

CREATE POLICY "Admins can delete sessions"
ON public.sessions FOR DELETE
USING (
  appointment_id IN (
    SELECT id FROM public.appointments
    WHERE clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'admin', 'super_admin')
    )
  )
);

-- -----------------------------------------------------
-- Tabla: medical_history
-- -----------------------------------------------------
-- Nota: Esta tabla puede llamarse patient_medical_history o medical_history
-- Ajustar según corresponda

-- Si la tabla se llama medical_history
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medical_history') THEN
    ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view medical history" ON public.medical_history;
    DROP POLICY IF EXISTS "Clinical staff can manage medical history" ON public.medical_history;

    EXECUTE 'CREATE POLICY "Users can view medical history from their clinic"
    ON public.medical_history FOR SELECT
    USING (
      patient_id IN (
        SELECT id FROM public.patients
        WHERE clinic_id IN (
          SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
        )
      )
    )';

    EXECUTE 'CREATE POLICY "Clinical staff can manage medical history"
    ON public.medical_history FOR ALL
    USING (
      patient_id IN (
        SELECT id FROM public.patients
        WHERE clinic_id IN (
          SELECT clinic_id FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN (''clinic_manager'', ''admin'', ''therapist'')
        )
      )
    )
    WITH CHECK (
      patient_id IN (
        SELECT id FROM public.patients
        WHERE clinic_id IN (
          SELECT clinic_id FROM public.user_profiles
          WHERE id = auth.uid()
          AND role IN (''clinic_manager'', ''admin'', ''therapist'')
        )
      )
    )';
  END IF;
END $$;

-- =====================================================
-- PASO 3: Crear índices para mejorar el rendimiento de RLS
-- =====================================================

-- Índices para mejorar las consultas de RLS
CREATE INDEX IF NOT EXISTS idx_user_profiles_id_clinic_id ON public.user_profiles(id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_id_role ON public.user_profiles(id, role);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id_id ON public.patients(clinic_id, id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id_id ON public.appointments(clinic_id, id);

-- =====================================================
-- PASO 4: Crear función helper para verificar aislamiento
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_user_clinic_id() IS 'Retorna el clinic_id del usuario actual';

-- =====================================================
-- PASO 5: Agregar checks de integridad
-- =====================================================

-- Trigger para asegurar que los appointments pertenezcan a la misma clínica que el paciente
CREATE OR REPLACE FUNCTION public.validate_appointment_clinic()
RETURNS TRIGGER AS $$
DECLARE
  patient_clinic_id uuid;
BEGIN
  SELECT clinic_id INTO patient_clinic_id
  FROM public.patients
  WHERE id = NEW.patient_id;

  IF patient_clinic_id IS NULL THEN
    RAISE EXCEPTION 'Patient does not exist or has no clinic assigned';
  END IF;

  IF NEW.clinic_id != patient_clinic_id THEN
    RAISE EXCEPTION 'Appointment clinic_id must match patient clinic_id';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_appointment_clinic_trigger ON public.appointments;
CREATE TRIGGER validate_appointment_clinic_trigger
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_appointment_clinic();

-- Trigger para asegurar que los payments pertenezcan a la misma clínica que el paciente
CREATE OR REPLACE FUNCTION public.validate_payment_clinic()
RETURNS TRIGGER AS $$
DECLARE
  patient_clinic_id uuid;
BEGIN
  SELECT clinic_id INTO patient_clinic_id
  FROM public.patients
  WHERE id = NEW.patient_id;

  IF patient_clinic_id IS NULL THEN
    RAISE EXCEPTION 'Patient does not exist or has no clinic assigned';
  END IF;

  IF NEW.clinic_id != patient_clinic_id THEN
    RAISE EXCEPTION 'Payment clinic_id must match patient clinic_id';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_payment_clinic_trigger ON public.payments;
CREATE TRIGGER validate_payment_clinic_trigger
  BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_payment_clinic();

COMMIT;

-- =====================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- =====================================================

-- Verificar que RLS esté habilitado en todas las tablas críticas
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'clinics', 'user_profiles', 'patients', 'appointments',
  'sessions', 'payments', 'patient_documents', 'body_map_annotations',
  'patient_consents', 'patient_exercises', 'exercise_templates'
)
ORDER BY tablename;
