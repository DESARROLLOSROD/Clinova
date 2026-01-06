'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';

interface ClinicSettingsFormProps {
  initialSettings: any;
}

export function ClinicSettingsForm({ initialSettings }: ClinicSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    const supabase = createClient();

    const formData = new FormData(e.currentTarget);
    const settingsData = {
      clinic_name: formData.get('clinic_name') as string,
      clinic_email: formData.get('clinic_email') as string || null,
      clinic_phone: formData.get('clinic_phone') as string || null,
      clinic_address: formData.get('clinic_address') as string || null,
      clinic_city: formData.get('clinic_city') as string || null,
      clinic_state: formData.get('clinic_state') as string || null,
      clinic_postal_code: formData.get('clinic_postal_code') as string || null,
      clinic_country: formData.get('clinic_country') as string || 'México',
      tax_id: formData.get('tax_id') as string || null,
      default_appointment_duration: formData.get('default_appointment_duration')
        ? parseInt(formData.get('default_appointment_duration') as string)
        : 60,
      default_session_price: formData.get('default_session_price')
        ? parseFloat(formData.get('default_session_price') as string)
        : null,
      currency: formData.get('currency') as string || 'MXN',
      enable_email_notifications: formData.get('enable_email_notifications') === 'true',
      enable_sms_notifications: formData.get('enable_sms_notifications') === 'true',
      cancellation_hours_notice: formData.get('cancellation_hours_notice')
        ? parseInt(formData.get('cancellation_hours_notice') as string)
        : 24,
      cancellation_policy: formData.get('cancellation_policy') as string || null,
    };

    try {
      if (initialSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('clinic_settings')
          .update(settingsData)
          .eq('id', initialSettings.id);
        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase.from('clinic_settings').insert([settingsData]);
        if (error) throw error;
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información de la Clínica */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>Datos básicos de tu clínica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clinic_name">Nombre de la Clínica *</Label>
              <Input
                id="clinic_name"
                name="clinic_name"
                required
                defaultValue={initialSettings?.clinic_name || ''}
                placeholder="Clinova"
              />
            </div>
            <div>
              <Label htmlFor="clinic_email">Email</Label>
              <Input
                id="clinic_email"
                name="clinic_email"
                type="email"
                defaultValue={initialSettings?.clinic_email || ''}
                placeholder="contacto@clinova.com"
              />
            </div>
            <div>
              <Label htmlFor="clinic_phone">Teléfono</Label>
              <Input
                id="clinic_phone"
                name="clinic_phone"
                defaultValue={initialSettings?.clinic_phone || ''}
                placeholder="55 1234 5678"
              />
            </div>
            <div>
              <Label htmlFor="tax_id">RFC / Tax ID</Label>
              <Input
                id="tax_id"
                name="tax_id"
                defaultValue={initialSettings?.tax_id || ''}
                placeholder="ABC123456XXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="clinic_address">Dirección</Label>
              <Input
                id="clinic_address"
                name="clinic_address"
                defaultValue={initialSettings?.clinic_address || ''}
                placeholder="Calle y número"
              />
            </div>
            <div>
              <Label htmlFor="clinic_city">Ciudad</Label>
              <Input
                id="clinic_city"
                name="clinic_city"
                defaultValue={initialSettings?.clinic_city || ''}
                placeholder="Ciudad de México"
              />
            </div>
            <div>
              <Label htmlFor="clinic_state">Estado</Label>
              <Input
                id="clinic_state"
                name="clinic_state"
                defaultValue={initialSettings?.clinic_state || ''}
                placeholder="CDMX"
              />
            </div>
            <div>
              <Label htmlFor="clinic_postal_code">Código Postal</Label>
              <Input
                id="clinic_postal_code"
                name="clinic_postal_code"
                defaultValue={initialSettings?.clinic_postal_code || ''}
                placeholder="01000"
              />
            </div>
            <div>
              <Label htmlFor="clinic_country">País</Label>
              <Input
                id="clinic_country"
                name="clinic_country"
                defaultValue={initialSettings?.clinic_country || 'México'}
                placeholder="México"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Citas */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Citas y Precios</CardTitle>
          <CardDescription>Configuración predeterminada para citas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="default_appointment_duration">Duración de Cita (minutos)</Label>
              <Input
                id="default_appointment_duration"
                name="default_appointment_duration"
                type="number"
                min="15"
                step="15"
                defaultValue={initialSettings?.default_appointment_duration || 60}
              />
            </div>
            <div>
              <Label htmlFor="default_session_price">Precio de Sesión</Label>
              <Input
                id="default_session_price"
                name="default_session_price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={initialSettings?.default_session_price || ''}
                placeholder="500.00"
              />
            </div>
            <div>
              <Label htmlFor="currency">Moneda</Label>
              <Input
                id="currency"
                name="currency"
                defaultValue={initialSettings?.currency || 'MXN'}
                placeholder="MXN"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Políticas */}
      <Card>
        <CardHeader>
          <CardTitle>Políticas y Notificaciones</CardTitle>
          <CardDescription>Configuración de políticas y recordatorios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cancellation_hours_notice">
              Horas de anticipación para cancelar
            </Label>
            <Input
              id="cancellation_hours_notice"
              name="cancellation_hours_notice"
              type="number"
              min="0"
              defaultValue={initialSettings?.cancellation_hours_notice || 24}
            />
          </div>

          <div>
            <Label htmlFor="cancellation_policy">Política de Cancelación</Label>
            <Textarea
              id="cancellation_policy"
              name="cancellation_policy"
              rows={3}
              defaultValue={initialSettings?.cancellation_policy || ''}
              placeholder="Las citas deben cancelarse con al menos 24 horas de anticipación..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enable_email_notifications"
                name="enable_email_notifications"
                value="true"
                defaultChecked={initialSettings?.enable_email_notifications !== false}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <Label htmlFor="enable_email_notifications" className="cursor-pointer">
                Habilitar notificaciones por email
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enable_sms_notifications"
                name="enable_sms_notifications"
                value="true"
                defaultChecked={initialSettings?.enable_sms_notifications === true}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <Label htmlFor="enable_sms_notifications" className="cursor-pointer">
                Habilitar notificaciones por SMS
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm">
          Configuración guardada exitosamente
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="gap-2">
          <Save size={18} />
          {isLoading ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  );
}
