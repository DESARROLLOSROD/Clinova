-- Add address fields to therapists table
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS hire_date date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS years_of_experience integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS specialties text[],
ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS license_number text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Add comment
COMMENT ON COLUMN public.therapists.status IS 'Estado del terapeuta (active, inactive, on_leave)';
COMMENT ON COLUMN public.therapists.specialties IS 'Lista de especialidades';
COMMENT ON COLUMN public.therapists.certifications IS 'Certificaciones y diplomas (JSON)';
COMMENT ON COLUMN public.therapists.hire_date IS 'Fecha de contratación';
COMMENT ON COLUMN public.therapists.address IS 'Dirección física del terapeuta';
