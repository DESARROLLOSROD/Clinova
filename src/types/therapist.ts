// =====================================================
// TIPOS: Fisioterapeutas
// =====================================================

export interface Certification {
  name: string;
  institution: string;
  date: string;
  expiry_date?: string;
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string; // "18:00"
}

export interface WeeklyAvailability {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export type TherapistStatus = 'active' | 'inactive' | 'on_leave';

export interface Therapist {
  id: string;
  auth_user_id?: string | null; // ID del usuario de Supabase Auth

  // Información personal
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;

  // Información profesional
  license_number?: string;
  specialties?: string[];
  certifications?: Certification[];
  years_of_experience?: number;

  // Información de contacto
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;

  // Horarios de disponibilidad
  availability?: WeeklyAvailability;

  // Estado y configuración
  status: TherapistStatus;
  hire_date?: string;

  // Avatar/Foto
  avatar_url?: string;

  // Notas
  notes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export type AssignmentStatus = 'active' | 'inactive';

export interface TherapistPatientAssignment {
  id: string;
  therapist_id: string;
  patient_id: string;

  // Información de asignación
  assigned_date: string;
  is_primary: boolean;
  status: AssignmentStatus;

  // Notas
  notes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relaciones (cuando se unen las tablas)
  therapist?: Therapist;
  patient?: any; // Puede importar el tipo Patient si es necesario
}

// Tipos para formularios
export interface TherapistFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  license_number?: string;
  specialties?: string[];
  certifications?: Certification[];
  years_of_experience?: number;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  availability?: WeeklyAvailability;
  status: TherapistStatus;
  hire_date?: string;
  avatar_url?: string;
  notes?: string;
}

// Tipo para estadísticas del terapeuta
export interface TherapistStats {
  therapist_id: string;
  total_patients: number;
  active_patients: number;
  total_appointments: number;
  completed_sessions: number;
  upcoming_appointments: number;
  total_hours_worked: number;
}
