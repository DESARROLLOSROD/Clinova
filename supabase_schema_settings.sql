-- =====================================================
-- TABLA: clinic_settings (Configuraciones de la Clínica)
-- Descripción: Configuración general del sistema
-- =====================================================

CREATE TABLE IF NOT EXISTS clinic_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información de la clínica
  clinic_name VARCHAR(200) NOT NULL DEFAULT 'Mi Clínica',
  clinic_logo_url TEXT,
  clinic_email VARCHAR(255),
  clinic_phone VARCHAR(20),
  clinic_address TEXT,
  clinic_city VARCHAR(100),
  clinic_state VARCHAR(100),
  clinic_postal_code VARCHAR(20),
  clinic_country VARCHAR(100) DEFAULT 'México',

  -- Información fiscal
  tax_id VARCHAR(50), -- RFC en México
  tax_regime VARCHAR(100),

  -- Horarios de atención
  business_hours JSONB, -- {monday: [{start: "09:00", end: "18:00"}], ...}
  timezone VARCHAR(50) DEFAULT 'America/Mexico_City',

  -- Configuración de citas
  default_appointment_duration INTEGER DEFAULT 60, -- minutos
  appointment_buffer_time INTEGER DEFAULT 0, -- tiempo entre citas en minutos
  allow_online_booking BOOLEAN DEFAULT false,
  cancellation_hours_notice INTEGER DEFAULT 24, -- horas de anticipación para cancelar

  -- Configuración de precios
  default_session_price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'MXN',
  tax_percentage DECIMAL(5,2) DEFAULT 0.00,

  -- Configuración de notificaciones
  enable_email_notifications BOOLEAN DEFAULT true,
  enable_sms_notifications BOOLEAN DEFAULT false,
  appointment_reminder_hours INTEGER DEFAULT 24, -- horas antes de la cita

  -- Configuración de facturación
  invoice_prefix VARCHAR(20) DEFAULT 'INV',
  next_invoice_number INTEGER DEFAULT 1,
  invoice_footer_text TEXT,

  -- Políticas y términos
  terms_and_conditions TEXT,
  privacy_policy TEXT,
  cancellation_policy TEXT,

  -- Redes sociales
  website_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,

  -- Configuración del sistema
  language VARCHAR(10) DEFAULT 'es',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  time_format VARCHAR(10) DEFAULT '24h',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Solo debe haber un registro de configuración
  CONSTRAINT single_settings_row CHECK (id = gen_random_uuid())
);

-- =====================================================
-- TABLA: service_prices (Catálogo de Servicios y Precios)
-- Descripción: Diferentes tipos de servicios y sus precios
-- =====================================================

CREATE TABLE IF NOT EXISTS service_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información del servicio
  service_name VARCHAR(200) NOT NULL,
  service_code VARCHAR(50) UNIQUE,
  description TEXT,
  category VARCHAR(100), -- Ej: "Consulta", "Terapia", "Evaluación"

  -- Precios
  price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2),

  -- Duración estimada
  duration_minutes INTEGER DEFAULT 60,

  -- Estado
  is_active BOOLEAN DEFAULT true,

  -- Notas
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: notification_templates (Plantillas de Notificaciones)
-- Descripción: Plantillas para emails y SMS
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificación
  template_name VARCHAR(100) NOT NULL UNIQUE,
  template_type VARCHAR(50) NOT NULL, -- 'email' o 'sms'
  trigger_event VARCHAR(100) NOT NULL, -- 'appointment_reminder', 'appointment_confirmation', etc.

  -- Contenido
  subject VARCHAR(200), -- Solo para emails
  body_template TEXT NOT NULL, -- Puede incluir variables {{patient_name}}, {{date}}, etc.

  -- Estado
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES para optimizar consultas
-- =====================================================

CREATE INDEX idx_service_prices_active ON service_prices(is_active);
CREATE INDEX idx_service_prices_category ON service_prices(category);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active);
CREATE INDEX idx_notification_templates_event ON notification_templates(trigger_event);

-- =====================================================
-- TRIGGERS para actualizar updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clinic_settings_updated_at
  BEFORE UPDATE ON clinic_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

CREATE TRIGGER service_prices_updated_at
  BEFORE UPDATE ON service_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

CREATE TRIGGER notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Políticas para clinic_settings
CREATE POLICY "Usuarios autenticados pueden ver configuración"
  ON clinic_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden actualizar configuración"
  ON clinic_settings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear configuración"
  ON clinic_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para service_prices
CREATE POLICY "Usuarios autenticados pueden ver precios"
  ON service_prices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear precios"
  ON service_prices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar precios"
  ON service_prices FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar precios"
  ON service_prices FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para notification_templates
CREATE POLICY "Usuarios autenticados pueden ver templates"
  ON notification_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear templates"
  ON notification_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar templates"
  ON notification_templates FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar templates"
  ON notification_templates FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar configuración por defecto (si no existe)
INSERT INTO clinic_settings (
  clinic_name,
  default_appointment_duration,
  default_session_price,
  currency,
  business_hours
) VALUES (
  'Clinova',
  60,
  500.00,
  'MXN',
  '{
    "monday": [{"start": "09:00", "end": "18:00"}],
    "tuesday": [{"start": "09:00", "end": "18:00"}],
    "wednesday": [{"start": "09:00", "end": "18:00"}],
    "thursday": [{"start": "09:00", "end": "18:00"}],
    "friday": [{"start": "09:00", "end": "18:00"}],
    "saturday": [{"start": "09:00", "end": "14:00"}],
    "sunday": []
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- Insertar servicios por defecto
INSERT INTO service_prices (service_name, service_code, category, price, duration_minutes) VALUES
('Consulta Inicial', 'CONS-INI', 'Consulta', 600.00, 60),
('Sesión de Fisioterapia', 'SES-FIS', 'Terapia', 500.00, 60),
('Sesión de Rehabilitación', 'SES-REH', 'Terapia', 550.00, 60),
('Evaluación Completa', 'EVAL-COMP', 'Evaluación', 700.00, 90),
('Terapia Manual', 'TER-MAN', 'Terapia', 450.00, 45),
('Electroterapia', 'ELEC-TER', 'Terapia', 400.00, 30)
ON CONFLICT (service_code) DO NOTHING;

-- Insertar plantillas de notificaciones por defecto
INSERT INTO notification_templates (template_name, template_type, trigger_event, subject, body_template) VALUES
(
  'Recordatorio de Cita',
  'email',
  'appointment_reminder',
  'Recordatorio: Cita en {{clinic_name}}',
  'Hola {{patient_name}},

Te recordamos que tienes una cita programada:

Fecha: {{appointment_date}}
Hora: {{appointment_time}}
Terapeuta: {{therapist_name}}

Si necesitas cancelar o reprogramar, por favor contacta con nosotros al menos {{cancellation_hours}} horas antes.

Saludos,
{{clinic_name}}'
),
(
  'Confirmación de Cita',
  'email',
  'appointment_confirmation',
  'Cita Confirmada - {{clinic_name}}',
  'Hola {{patient_name}},

Tu cita ha sido confirmada:

Fecha: {{appointment_date}}
Hora: {{appointment_time}}
Terapeuta: {{therapist_name}}

Te esperamos en nuestra clínica ubicada en:
{{clinic_address}}

Saludos,
{{clinic_name}}'
)
ON CONFLICT (template_name) DO NOTHING;
