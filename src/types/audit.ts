export interface AuditLogEntry {
    id: string;
    user_id: string | null;
    action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'SIGNATURE';
    entity_type: string;
    entity_id: string | null;
    details: {
        old_data?: any;
        new_data?: any;
        ip?: string;
        user_agent?: string;
    };
    created_at: string;

    // Joined profile/therapist info if available
    profiles?: {
        full_name: string;
    };
}
