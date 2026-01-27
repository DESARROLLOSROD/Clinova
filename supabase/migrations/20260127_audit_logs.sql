-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100), -- e.g., 'patient', 'appointment', 'auth'
    entity_id UUID,          -- ID of the affected record
    details JSONB,           -- Extra data (e.g., changes made)
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- Super Admins can view all logs
CREATE POLICY "Super Admins can view all logs" 
    ON audit_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Users can view their own logs (optional, maybe distinct for strict security)
-- For now, let's keep it restricted to Super Admins mainly, or Clinic Managers for their own clinic if we add clinic_id
-- Adding clinic_id to make it multi-tenant friendly
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);

CREATE POLICY "Clinic Admins can view their clinic logs" 
    ON audit_logs FOR SELECT 
    USING (
        clinic_id IN (
            SELECT clinic_id FROM user_profiles
            WHERE id = auth.uid() AND role IN ('clinic_admin', 'clinic_manager')
        )
    );

-- Allow insertion by authenticated users (via server actions/triggers)
CREATE POLICY "System can insert logs" 
    ON audit_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
