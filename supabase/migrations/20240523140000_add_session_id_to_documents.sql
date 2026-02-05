-- Add session_id to patient_documents table
ALTER TABLE public.patient_documents
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS patient_documents_session_id_idx ON public.patient_documents(session_id);

COMMENT ON COLUMN public.patient_documents.session_id IS 'Reference to the session this document belongs to (e.g., photo taken during session)';
