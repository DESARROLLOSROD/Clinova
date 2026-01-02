export interface MedicalHistory {
    id: string
    patient_id: string
    allergies?: string[]
    chronic_conditions?: string[]
    current_medications?: string[]
    previous_surgeries?: string[]
    family_history?: string
    lifestyle_notes?: string
    emergency_contact_name?: string
    emergency_contact_phone?: string
    emergency_contact_relationship?: string
    blood_type?: string
    height_cm?: number
    weight_kg?: number
    created_at: string
    updated_at: string
}

export interface InitialAssessment {
    id: string
    patient_id: string
    assessed_by?: string
    assessment_date: string
    chief_complaint: string
    history_of_present_illness?: string
    pain_description?: string
    pain_location?: string
    pain_intensity?: number
    onset_date?: string
    aggravating_factors?: string[]
    relieving_factors?: string[]
    functional_limitations?: string
    previous_treatments?: string
    assessment_findings?: string
    diagnosis?: string
    treatment_goals?: string[]
    recommended_treatment_plan?: string
    prognosis?: string
    notes?: string
    created_at: string
    updated_at: string
}

export interface PatientMeasurement {
    id: string
    patient_id: string
    session_id?: string
    measured_by?: string
    measurement_date: string
    measurement_type: string
    body_part?: string
    measurement_value?: number
    measurement_unit?: string
    notes?: string
    created_at: string
}
