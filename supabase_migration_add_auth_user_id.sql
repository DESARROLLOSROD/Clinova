-- Migration: Add auth_user_id to therapists table
-- This links therapists to their Supabase Auth user accounts

-- Add auth_user_id column to therapists table
ALTER TABLE public.therapists
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_therapists_auth_user_id
ON public.therapists(auth_user_id);

-- Add unique constraint to ensure one therapist per auth user
ALTER TABLE public.therapists
ADD CONSTRAINT unique_auth_user_id UNIQUE (auth_user_id);

-- Add comment for documentation
COMMENT ON COLUMN public.therapists.auth_user_id IS 'References the Supabase Auth user ID for login credentials';
