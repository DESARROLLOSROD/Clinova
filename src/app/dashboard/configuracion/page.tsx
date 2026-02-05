'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { Building2, Save, MapPin, Phone, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { NotificationSettings } from '@/components/settings/NotificationSettings'
import { LogoUpload } from '@/components/settings/LogoUpload'

export default function ClinicConfigurationPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clinicData, setClinicData] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadClinicData()
  }, [])

  async function loadClinicData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile to find clinic_id
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('clinic_id, role')
        .eq('id', user.id)
        .single()

      if (!profile?.clinic_id) {
        // If super admin and no clinic (which shouldn't happen in this view usually unless managing specific clinic)
        // For now assume logged in user manages their own clinic
        toast.error('No se encontró información de la clínica asociada')
        return
      }

      // Get clinic details
      const { data: clinic, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', profile.clinic_id)
        .single()

      if (error) throw error
      setClinicData(clinic)
    } catch (error) {
      console.error('Error loading clinic:', error)
      toast.error('Error al cargar datos de la clínica')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('clinics')
        .update({
          name: clinicData.name,
          phone: clinicData.phone,
          address: clinicData.address,
          city: clinicData.city,
          state: clinicData.state,
          country: clinicData.country,
          website: clinicData.website,
          logo_url: clinicData.logo_url,
          primary_color: clinicData.primary_color,
          secondary_color: clinicData.secondary_color
        })
        .eq('id', clinicData.id)

      if (error) throw error
      toast.success('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error saving clinic:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
  }

  if (!clinicData) {
    return <div className="p-8 text-center text-gray-500">No se pudo cargar la información de la clínica.</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Building2 className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración de la Clínica</h1>
          <p className="text-gray-500">Administra la información pública y apariencia de tu clínica</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo de la Clínica */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Logo de la Clínica</h2>
          <LogoUpload
            clinicId={clinicData.id}
            currentLogoUrl={clinicData.logo_url}
            onLogoUpdated={(newUrl) => setClinicData({ ...clinicData, logo_url: newUrl })}
          />
        </Card>

        {/* Identidad de Marca */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Identidad de Marca
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Clínica</Label>
              <Input
                id="name"
                value={clinicData.name || ''}
                onChange={e => setClinicData({ ...clinicData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_color">Color Primario</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={clinicData.primary_color || '#3b82f6'}
                  onChange={e => setClinicData({ ...clinicData, primary_color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={clinicData.primary_color || '#3b82f6'}
                  onChange={e => setClinicData({ ...clinicData, primary_color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color">Color Secundario</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={clinicData.secondary_color || '#1e40af'}
                  onChange={e => setClinicData({ ...clinicData, secondary_color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={clinicData.secondary_color || '#1e40af'}
                  onChange={e => setClinicData({ ...clinicData, secondary_color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Información de Contacto */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            Ubicación y Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Textarea
                id="address"
                value={clinicData.address || ''}
                onChange={e => setClinicData({ ...clinicData, address: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={clinicData.city || ''}
                onChange={e => setClinicData({ ...clinicData, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado/Provincia</Label>
              <Input
                id="state"
                value={clinicData.state || ''}
                onChange={e => setClinicData({ ...clinicData, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={clinicData.country || ''}
                onChange={e => setClinicData({ ...clinicData, country: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  className="pl-9"
                  value={clinicData.phone || ''}
                  onChange={e => setClinicData({ ...clinicData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="website"
                  className="pl-9"
                  value={clinicData.website || ''}
                  onChange={e => setClinicData({ ...clinicData, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Notificaciones */}
        <NotificationSettings />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={saving} size="lg" className="w-full md:w-auto">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
