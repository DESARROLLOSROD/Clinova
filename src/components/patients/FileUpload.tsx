'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  patientId: string;
  assessmentId?: string;
  onFilesUploaded?: (files: UploadedFile[]) => void;
}

interface UploadedFile {
  id: string;
  file_name: string;
  file_type: 'image' | 'pdf';
  storage_path: string;
  document_type: string;
  description?: string;
}

export function FileUpload({ patientId, assessmentId, onFilesUploaded }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Validate file types
      const validFiles = newFiles.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';
        return isImage || isPDF;
      });

      // Validate file size (max 10MB)
      const validSizedFiles = validFiles.filter(file => file.size <= 10 * 1024 * 1024);

      if (validSizedFiles.length !== newFiles.length) {
        alert('Algunos archivos fueron rechazados. Solo se permiten imágenes y PDFs menores a 10MB.');
      }

      setFiles(prev => [...prev, ...validSizedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const uploaded: UploadedFile[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Get clinic_id
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

      if (!profile?.clinic_id) throw new Error('No se encontró la clínica');

      for (const file of files) {
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${profile.clinic_id}/${patientId}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('patient-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          continue;
        }

        // Determine file type
        const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

        // Save reference in database
        const { data: documentData, error: dbError } = await supabase
          .from('patient_documents')
          .insert({
            patient_id: patientId,
            assessment_id: assessmentId || null,
            clinic_id: profile.clinic_id,
            file_name: file.name,
            file_type: fileType,
            file_size_bytes: file.size,
            storage_path: filePath,
            mime_type: file.type,
            document_type: fileType === 'image' ? 'foto_paciente' : 'documento_medico',
            uploaded_by: user.id,
          })
          .select()
          .single();

        if (dbError) {
          console.error('Error saving file reference:', dbError);
          // Delete from storage if DB insert failed
          await supabase.storage.from('patient-documents').remove([filePath]);
          continue;
        }

        uploaded.push(documentData);
      }

      setUploadedFiles(prev => [...prev, ...uploaded]);
      setFiles([]); // Clear file list

      if (onFilesUploaded) {
        onFilesUploaded(uploaded);
      }

      alert(`${uploaded.length} archivo(s) subido(s) exitosamente`);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Click para subir archivos
              </span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                accept="image/*,.pdf"
                className="sr-only"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Imágenes (JPG, PNG) o PDFs hasta 10MB
          </p>
        </div>
      </div>

      {/* Files to upload */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Archivos seleccionados ({files.length})
            </h4>
            <Button
              onClick={uploadFiles}
              disabled={uploading}
              size="sm"
              className="flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Subir Archivos
                </>
              )}
            </Button>
          </div>

          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                ) : (
                  <FileText className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={uploading}
                className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-green-700">
            ✓ Archivos subidos ({uploadedFiles.length})
          </h4>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
            >
              {file.file_type === 'image' ? (
                <ImageIcon className="h-5 w-5 text-green-600" />
              ) : (
                <FileText className="h-5 w-5 text-green-600" />
              )}
              <p className="text-sm font-medium text-gray-900">{file.file_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
