export interface ConsentTemplate {
    id: string;
    title: string;
    content: string;
    description: string | null;
    is_active: boolean;
    category: string | null;
    created_at: string;
    updated_at: string;
    created_by: string | null;
}

export interface PatientSignature {
    id: string;
    patient_id: string;
    consent_template_id: string | null;
    signature_image_url: string | null;
    signed_at: string;
    ip_address: string | null;
    user_agent: string | null;
    witness_name: string | null;
    notes: string | null;
    is_valid: boolean;
    created_at: string;

    // Joins
    templates?: ConsentTemplate;
}
