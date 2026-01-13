-- ============================================================================
-- Patient Documents and Files
-- ============================================================================
-- This migration creates tables for storing patient documents, images, and PDFs
-- Files are stored in Supabase Storage, references stored in database
-- ============================================================================

-- Create patient_documents table
CREATE TABLE IF NOT EXISTS public.patient_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.initial_assessments(id) ON DELETE SET NULL,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,

  -- File information
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image' or 'pdf'
  file_size_bytes INTEGER,
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  mime_type TEXT,

  -- Metadata
  document_type TEXT, -- 'radiografia', 'laboratorio', 'receta', 'foto_paciente', etc.
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX patient_documents_patient_id_idx ON public.patient_documents(patient_id);
CREATE INDEX patient_documents_assessment_id_idx ON public.patient_documents(assessment_id);
CREATE INDEX patient_documents_clinic_id_idx ON public.patient_documents(clinic_id);
CREATE INDEX patient_documents_document_type_idx ON public.patient_documents(document_type);
CREATE INDEX patient_documents_created_at_idx ON public.patient_documents(created_at DESC);

-- Comments
COMMENT ON TABLE public.patient_documents IS 'Almacena referencias a archivos subidos por pacientes (fotos, PDFs, etc.)';
COMMENT ON COLUMN public.patient_documents.file_type IS 'Tipo de archivo: image (jpg, png) o pdf';
COMMENT ON COLUMN public.patient_documents.storage_path IS 'Ruta del archivo en Supabase Storage bucket';
COMMENT ON COLUMN public.patient_documents.document_type IS 'Categoría del documento: radiografia, laboratorio, receta, foto_paciente, etc.';

-- Trigger for updated_at
CREATE TRIGGER update_patient_documents_updated_at
  BEFORE UPDATE ON public.patient_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

-- Users can view documents from their clinic
CREATE POLICY "Users can view documents from their clinic"
  ON public.patient_documents FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );

-- Users can insert documents for patients in their clinic
CREATE POLICY "Users can insert documents for their clinic patients"
  ON public.patient_documents FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
    )
    AND
    patient_id IN (
      SELECT id FROM public.patients WHERE clinic_id IN (
        SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Users can delete their own uploaded documents
CREATE POLICY "Users can delete their uploaded documents"
  ON public.patient_documents FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR
    clinic_id IN (
      SELECT clinic_id FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('clinic_manager', 'super_admin')
    )
  );

-- ============================================================================
-- Supabase Storage Bucket Configuration
-- ============================================================================
-- Note: This needs to be run in Supabase Dashboard → Storage
-- OR via SQL if you have storage schema access
--
-- Bucket name: patient-documents
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/jpg, application/pdf
-- ============================================================================

-- Grant storage permissions (if storage schema is available)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('patient-documents', 'patient-documents', false)
-- ON CONFLICT DO NOTHING;
