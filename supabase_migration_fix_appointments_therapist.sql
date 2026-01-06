-- Migration: Fix appointments.therapist_id to reference therapists table instead of auth.users
-- This allows assigning therapists from the therapists table to appointments

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.appointments
DROP CONSTRAINT IF EXISTS appointments_therapist_id_fkey;

-- Step 2: Update any existing therapist_id values to NULL (since they reference wrong table)
-- You may want to manually map these if you have existing data
UPDATE public.appointments
SET therapist_id = NULL
WHERE therapist_id IS NOT NULL;

-- Step 3: Add the new foreign key constraint pointing to therapists table
ALTER TABLE public.appointments
ADD CONSTRAINT appointments_therapist_id_fkey
FOREIGN KEY (therapist_id)
REFERENCES public.therapists(id)
ON DELETE SET NULL;

-- Step 4: Create an index for better performance on therapist lookups
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id
ON public.appointments(therapist_id);

-- Verification query (optional - you can run this after migration)
-- SELECT
--   a.id,
--   a.patient_id,
--   a.therapist_id,
--   t.first_name || ' ' || t.last_name as therapist_name
-- FROM appointments a
-- LEFT JOIN therapists t ON a.therapist_id = t.id
-- LIMIT 5;
