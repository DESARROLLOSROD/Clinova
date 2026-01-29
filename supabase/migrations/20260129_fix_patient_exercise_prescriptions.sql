-- Fix patient_exercise_prescriptions table columns
ALTER TABLE public.patient_exercise_prescriptions 
ADD COLUMN IF NOT EXISTS duration_minutes integer,
ADD COLUMN IF NOT EXISTS frequency_per_week integer,
ADD COLUMN IF NOT EXISTS instructions text;
