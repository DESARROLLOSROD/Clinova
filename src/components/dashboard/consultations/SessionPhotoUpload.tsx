'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface SessionPhotoUploadProps {
    onPhotosChange: (photos: { path: string; name: string; type: string; size: number }[]) => void;
}

export function SessionPhotoUpload({ onPhotosChange }: SessionPhotoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [photos, setPhotos] = useState<{ path: string; name: string; preview: string; type: string; size: number }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const files = Array.from(e.target.files);
        const newPhotos = [];

        for (const file of files) {
            try {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast.error(`El archivo ${file.name} no es una imagen.`);
                    continue;
                }

                // Compress? (Optional, skip for now)

                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `session-images/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('patient-documents')
                    .upload(filePath, file);

                if (uploadError) {
                    throw uploadError;
                }

                newPhotos.push({
                    path: filePath,
                    name: file.name,
                    preview: URL.createObjectURL(file), // For local preview
                    type: file.type,
                    size: file.size
                });
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Error al subir la imagen. Inténtalo de nuevo.');
            }
        }

        const updatedPhotos = [...photos, ...newPhotos];
        setPhotos(updatedPhotos);
        onPhotosChange(updatedPhotos.map(({ preview, ...rest }) => rest));
        setUploading(false);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removePhoto = (index: number) => {
        const updatedPhotos = photos.filter((_, i) => i !== index);
        setPhotos(updatedPhotos);
        onPhotosChange(updatedPhotos.map(({ preview, ...rest }) => rest));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-2 border-dashed border-2"
                >
                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                    {uploading ? 'Subiendo...' : 'Agregar Foto'}
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                />
                <span className="text-sm text-gray-500">
                    Sube fotos de la zona afectada o progreso.
                </span>
            </div>

            {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border bg-gray-100 aspect-square">
                            <img
                                src={photo.preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
