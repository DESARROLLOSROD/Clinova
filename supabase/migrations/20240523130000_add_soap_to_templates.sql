-- Add SOAP fields to treatment_templates table
ALTER TABLE public.treatment_templates
ADD COLUMN IF NOT EXISTS subjective TEXT,
ADD COLUMN IF NOT EXISTS objective TEXT,
ADD COLUMN IF NOT EXISTS assessment TEXT,
ADD COLUMN IF NOT EXISTS plan TEXT;

COMMENT ON COLUMN public.treatment_templates.subjective IS 'Default text for Subjective section of SOAP note';
COMMENT ON COLUMN public.treatment_templates.objective IS 'Default text for Objective section of SOAP note';
COMMENT ON COLUMN public.treatment_templates.assessment IS 'Default text for Assessment section of SOAP note';
COMMENT ON COLUMN public.treatment_templates.plan IS 'Default text for Plan section of SOAP note';
