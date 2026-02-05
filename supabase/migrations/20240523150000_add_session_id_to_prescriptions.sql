-- Add session_id to patient_prescriptions table
ALTER TABLE public.patient_prescriptions
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS patient_prescriptions_session_id_idx ON public.patient_prescriptions(session_id);

COMMENT ON COLUMN public.patient_prescriptions.session_id IS 'Reference to the session during which this prescription was created';
