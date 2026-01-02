export type TreatmentPlanStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export interface TreatmentTemplate {
    id: string
    name: string
    description?: string
    category?: string
    duration_minutes?: number
    frequency?: string
    objectives?: string[]
    contraindications?: string[]
    notes?: string
    created_by?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface TemplateTechnique {
    id: string
    template_id: string
    name: string
    description?: string
    duration_minutes?: number
    order_index: number
    created_at: string
}

export interface PatientTreatmentPlan {
    id: string
    patient_id: string
    template_id?: string
    therapist_id?: string
    start_date: string
    end_date?: string
    status: TreatmentPlanStatus
    goals?: string
    progress_notes?: string
    sessions_planned?: number
    sessions_completed: number
    created_at: string
    updated_at: string
}
