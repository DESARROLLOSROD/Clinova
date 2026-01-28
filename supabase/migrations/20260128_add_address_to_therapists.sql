-- Add address fields to therapists table
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text;

-- Add comment
COMMENT ON COLUMN public.therapists.address IS 'Dirección física del terapeuta';
