import { Patient } from './patient'

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
    id: string
    patient_id: string
    therapist_id?: string
    title?: string
    start_time: string
    end_time: string
    status: AppointmentStatus
    notes?: string
    created_at: string
    // Joins
    patients?: Patient
}
