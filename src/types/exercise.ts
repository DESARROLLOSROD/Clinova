export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type PrescriptionStatus = 'active' | 'completed' | 'discontinued'

export interface Exercise {
    id: string
    name: string
    description?: string
    category?: string
    body_part?: string
    difficulty?: ExerciseDifficulty
    equipment_needed?: string[]
    instructions?: string
    video_url?: string
    image_url?: string
    contraindications?: string[]
    created_by?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface ExercisePrescription {
    id: string
    patient_id: string
    exercise_id?: string
    prescribed_by?: string
    session_id?: string
    sets?: number
    repetitions?: number
    duration_seconds?: number
    frequency?: string
    notes?: string
    start_date: string
    end_date?: string
    status: PrescriptionStatus
    created_at: string
    updated_at: string
}

export interface ExerciseAdherence {
    id: string
    prescription_id: string
    completed_date: string
    sets_completed?: number
    repetitions_completed?: number
    duration_seconds?: number
    difficulty_rating?: number
    pain_level?: number
    notes?: string
    created_at: string
}
