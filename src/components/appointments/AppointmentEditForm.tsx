'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TherapistSelect } from '@/components/therapists/TherapistSelect';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AppointmentEditFormProps {
  appointment: any;
}

export function AppointmentEditForm({ appointment }: AppointmentEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [therapistId, setTherapistId] = useState(appointment.therapist_id || '');
  const [status, setStatus] = useState(appointment.status);

  const appointmentDate = format(new Date(appointment.start_time), 'yyyy-MM-dd');
  const appointmentTime = format(new Date(appointment.start_time), 'HH:mm');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const duration = 60;

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const updateData = {
      therapist_id: therapistId || null,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      notes: formData.get('notes') as string,
      status: status,
    };

    try {
      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointment.id);

      if (error) throw error;

      router.push('/dashboard/agenda');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Cita</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Info - Read only */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Label className="text-gray-700">Paciente</Label>
            <p className="text-lg font-medium text-gray-900 mt-1">
              {appointment.patients?.first_name} {appointment.patients?.last_name}
            </p>
            <p className="text-sm text-gray-600">{appointment.patients?.email}</p>
          </div>

          {/* Therapist Assignment */}
          <div>
            <TherapistSelect
              name="therapist_id"
              defaultValue={appointment.therapist_id}
              onValueChange={setTherapistId}
            />
            {appointment.therapists && (
              <p className="text-sm text-gray-600 mt-2">
                Asignado actualmente a: {appointment.therapists.first_name}{' '}
                {appointment.therapists.last_name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Fecha *</Label>
              <Input
                type="date"
                name="date"
                id="date"
                required
                defaultValue={appointmentDate}
              />
            </div>
            <div>
              <Label htmlFor="time">Hora *</Label>
              <Input
                type="time"
                name="time"
                id="time"
                required
                defaultValue={appointmentTime}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select name="status" value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="no_show">No asistió</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notas</Label>
            <Input
              name="notes"
              id="notes"
              placeholder="Notas adicionales..."
              defaultValue={appointment.notes || ''}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
