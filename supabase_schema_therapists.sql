-- =====================================================
-- TABLA: therapists (Fisioterapeutas)
-- Descripción: Gestión de fisioterapeutas y su información
-- =====================================================

-- Crear tabla de fisioterapeutas
CREATE TABLE IF NOT EXISTS therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Información personal
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),

  -- Información profesional
  license_number VARCHAR(50) UNIQUE,
  specialties TEXT[], -- Array de especialidades
  certifications JSONB, -- [{name, institution, date, expiry_date}]
  years_of_experience INTEGER,

  -- Información de contacto
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  emergency_contact_name VARCHAR(150),
  emergency_contact_phone VARCHAR(20),

  -- Horarios de disponibilidad
  availability JSONB, -- {monday: [{start: "09:00", end: "13:00"}, ...], ...}

  -- Estado y configuración
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  hire_date DATE,

  -- Avatar/Foto
  avatar_url TEXT,

  -- Notas
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: therapist_patient_assignments (Asignación de Pacientes)
-- Descripción: Relación entre fisioterapeutas y pacientes
-- =====================================================

CREATE TABLE IF NOT EXISTS therapist_patient_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES therapists(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,

  -- Información de asignación
  assigned_date DATE DEFAULT CURRENT_DATE,
  is_primary BOOLEAN DEFAULT true, -- Si es el terapeuta principal del paciente
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  -- Notas
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES para optimizar consultas
-- =====================================================

CREATE INDEX idx_therapists_auth_user_id ON therapists(auth_user_id);
CREATE INDEX idx_therapists_email ON therapists(email);
CREATE INDEX idx_therapists_status ON therapists(status);
CREATE INDEX idx_therapists_license ON therapists(license_number);

CREATE INDEX idx_assignments_therapist ON therapist_patient_assignments(therapist_id);
CREATE INDEX idx_assignments_patient ON therapist_patient_assignments(patient_id);
CREATE INDEX idx_assignments_status ON therapist_patient_assignments(status);

-- Índice único parcial: Un paciente solo puede tener un terapeuta principal activo
CREATE UNIQUE INDEX idx_unique_primary_therapist
  ON therapist_patient_assignments(patient_id)
  WHERE (is_primary = true AND status = 'active');

-- =====================================================
-- TRIGGERS para actualizar updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_therapist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER therapists_updated_at
  BEFORE UPDATE ON therapists
  FOR EACH ROW
  EXECUTE FUNCTION update_therapist_updated_at();

CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON therapist_patient_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_therapist_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_patient_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas para therapists
CREATE POLICY "Usuarios autenticados pueden ver fisioterapeutas"
  ON therapists FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear fisioterapeutas"
  ON therapists FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar fisioterapeutas"
  ON therapists FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar fisioterapeutas"
  ON therapists FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para asignaciones
CREATE POLICY "Usuarios autenticados pueden ver asignaciones"
  ON therapist_patient_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear asignaciones"
  ON therapist_patient_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar asignaciones"
  ON therapist_patient_assignments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar asignaciones"
  ON therapist_patient_assignments FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- MODIFICAR TABLAS EXISTENTES
-- =====================================================

-- Agregar referencia de terapeuta a appointments
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS therapist_id UUID REFERENCES therapists(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_therapist ON appointments(therapist_id);

-- Agregar referencia de terapeuta a sessions
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS therapist_id UUID REFERENCES therapists(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_therapist ON sessions(therapist_id);

-- Agregar referencia de terapeuta a patients (terapeuta principal)
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS primary_therapist_id UUID REFERENCES therapists(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_patients_primary_therapist ON patients(primary_therapist_id);

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL - Comentar en producción)
-- =====================================================

-- Insertar fisioterapeutas de ejemplo
-- INSERT INTO therapists (first_name, last_name, email, phone, license_number, specialties, status, hire_date) VALUES
-- ('María', 'García', 'maria.garcia@clinova.com', '555-0101', 'FT-001', ARRAY['Ortopedia', 'Deportiva'], 'active', '2023-01-15'),
-- ('Carlos', 'Rodríguez', 'carlos.rodriguez@clinova.com', '555-0102', 'FT-002', ARRAY['Neurología', 'Pediátrica'], 'active', '2023-03-20'),
-- ('Ana', 'Martínez', 'ana.martinez@clinova.com', '555-0103', 'FT-003', ARRAY['Geriátrica', 'Rehabilitación'], 'active', '2023-06-10');
