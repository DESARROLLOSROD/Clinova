'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface LogoUploadProps {
  clinicId: string
  currentLogoUrl?: string | null
  onLogoUpdated?: (newUrl: string | null) => void
}

export function LogoUpload({ clinicId, currentLogoUrl, onLogoUpdated }: LogoUploadProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      toast.error('Formato no válido. Usa JPG, PNG, WebP o SVG.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es muy grande. Máximo 5MB.')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadLogo = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      // Generate unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `${clinicId}/${fileName}`

      // Delete old logo if exists
      if (logoUrl) {
        const oldPath = logoUrl.split('/clinic-logos/')[1]
        if (oldPath) {
          await supabase.storage.from('clinic-logos').remove([oldPath])
        }
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from('clinic-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        toast.error('Error al subir el logo')
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('clinic-logos')
        .getPublicUrl(filePath)

      // Update clinic record
      const { error: updateError } = await supabase
        .from('clinics')
        .update({ logo_url: publicUrl })
        .eq('id', clinicId)

      if (updateError) {
        console.error('Update error:', updateError)
        toast.error('Error al actualizar el logo')
        return
      }

      setLogoUrl(publicUrl)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast.success('Logo actualizado correctamente')
      onLogoUpdated?.(publicUrl)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al subir el logo')
    } finally {
      setUploading(false)
    }
  }

  const removeLogo = async () => {
    if (!logoUrl) return

    setUploading(true)

    try {
      // Delete from storage
      const filePath = logoUrl.split('/clinic-logos/')[1]
      if (filePath) {
        await supabase.storage.from('clinic-logos').remove([filePath])
      }

      // Update clinic record
      const { error: updateError } = await supabase
        .from('clinics')
        .update({ logo_url: null })
        .eq('id', clinicId)

      if (updateError) {
        console.error('Update error:', updateError)
        toast.error('Error al eliminar el logo')
        return
      }

      setLogoUrl(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      toast.success('Logo eliminado')
      onLogoUpdated?.(null)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar el logo')
    } finally {
      setUploading(false)
    }
  }

  const cancelPreview = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayUrl = preview || logoUrl

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-6">
        {/* Logo Preview */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/50 overflow-hidden">
            {displayUrl ? (
              <Image
                src={displayUrl}
                alt="Logo de la clínica"
                width={128}
                height={128}
                className="w-full h-full object-contain"
                unoptimized={displayUrl.startsWith('data:')}
              />
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <span className="text-xs text-muted-foreground">Sin logo</span>
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-sm font-medium">Logo de la Clínica</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Recomendado: imagen cuadrada de al menos 256x256 px. Formatos: JPG, PNG, WebP, SVG. Máximo 5MB.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            {preview ? (
              <>
                <Button
                  type="button"
                  onClick={uploadLogo}
                  disabled={uploading}
                  size="sm"
                  className="gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? 'Subiendo...' : 'Guardar Logo'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelPreview}
                  disabled={uploading}
                  size="sm"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {logoUrl ? 'Cambiar Logo' : 'Subir Logo'}
                </Button>

                {logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={removeLogo}
                    disabled={uploading}
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Eliminar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
