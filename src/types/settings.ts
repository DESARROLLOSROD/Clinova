// =====================================================
// TIPOS: Configuraciones del Sistema
// =====================================================

import { WeeklyAvailability } from './therapist';

export interface ClinicSettings {
  id: string;

  // Información de la clínica
  clinic_name: string;
  clinic_logo_url?: string;
  clinic_email?: string;
  clinic_phone?: string;
  clinic_address?: string;
  clinic_city?: string;
  clinic_state?: string;
  clinic_postal_code?: string;
  clinic_country: string;

  // Información fiscal
  tax_id?: string;
  tax_regime?: string;

  // Horarios de atención
  business_hours?: WeeklyAvailability;
  timezone: string;

  // Configuración de citas
  default_appointment_duration: number;
  appointment_buffer_time: number;
  allow_online_booking: boolean;
  cancellation_hours_notice: number;

  // Configuración de precios
  default_session_price?: number;
  currency: string;
  tax_percentage: number;

  // Configuración de notificaciones
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  appointment_reminder_hours: number;

  // Configuración de facturación
  invoice_prefix: string;
  next_invoice_number: number;
  invoice_footer_text?: string;

  // Políticas y términos
  terms_and_conditions?: string;
  privacy_policy?: string;
  cancellation_policy?: string;

  // Redes sociales
  website_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;

  // Configuración del sistema
  language: string;
  date_format: string;
  time_format: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ServicePrice {
  id: string;

  // Información del servicio
  service_name: string;
  service_code?: string;
  description?: string;
  category?: string;

  // Precios
  price: number;
  discounted_price?: number;

  // Duración estimada
  duration_minutes: number;

  // Estado
  is_active: boolean;

  // Notas
  notes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export type NotificationTemplateType = 'email' | 'sms';

export interface NotificationTemplate {
  id: string;

  // Identificación
  template_name: string;
  template_type: NotificationTemplateType;
  trigger_event: string;

  // Contenido
  subject?: string;
  body_template: string;

  // Estado
  is_active: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Tipos para formularios
export interface ClinicSettingsFormData {
  clinic_name: string;
  clinic_logo_url?: string;
  clinic_email?: string;
  clinic_phone?: string;
  clinic_address?: string;
  clinic_city?: string;
  clinic_state?: string;
  clinic_postal_code?: string;
  clinic_country: string;
  tax_id?: string;
  tax_regime?: string;
  business_hours?: WeeklyAvailability;
  timezone: string;
  default_appointment_duration: number;
  appointment_buffer_time: number;
  allow_online_booking: boolean;
  cancellation_hours_notice: number;
  default_session_price?: number;
  currency: string;
  tax_percentage: number;
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  appointment_reminder_hours: number;
  invoice_prefix: string;
  invoice_footer_text?: string;
  terms_and_conditions?: string;
  privacy_policy?: string;
  cancellation_policy?: string;
  website_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  language: string;
  date_format: string;
  time_format: string;
}

export interface ServicePriceFormData {
  service_name: string;
  service_code?: string;
  description?: string;
  category?: string;
  price: number;
  discounted_price?: number;
  duration_minutes: number;
  is_active: boolean;
  notes?: string;
}

export interface NotificationTemplateFormData {
  template_name: string;
  template_type: NotificationTemplateType;
  trigger_event: string;
  subject?: string;
  body_template: string;
  is_active: boolean;
}
