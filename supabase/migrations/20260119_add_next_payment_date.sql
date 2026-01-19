-- Add next_payment_date to clinics table
ALTER TABLE public.clinics
ADD COLUMN IF NOT EXISTS next_payment_date DATE;

-- Comment on column
COMMENT ON COLUMN public.clinics.next_payment_date IS 'Date when the next subscription payment is due';

-- Update existing clinics to have a default next_payment_date (e.g., 30 days from now or based on creation)
-- This is just a placeholder logic to ensure data isn't null for testing
UPDATE public.clinics
SET next_payment_date = (CURRENT_DATE + INTERVAL '30 days')::DATE
WHERE next_payment_date IS NULL;
