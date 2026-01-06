'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { TherapistSelect } from '@/components/therapists/TherapistSelect';
import { Edit, X, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AppointmentEditDialogProps {
  appointmentId: string;
  currentTherapistId?: string;
  patientName: string;
  appointmentTime: string;
}

export function AppointmentEditDialog({
  appointmentId,
  currentTherapistId,
  patientName,
  appointmentTime,
}: AppointmentEditDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [therapistId, setTherapistId] = useState(currentTherapistId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAssignTherapist() {
    if (!therapistId) {
      setError('Por favor selecciona un fisioterapeuta');
      return;
    }

    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ therapist_id: therapistId })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="gap-2"
      >
        <Edit size={16} />
        {currentTherapistId ? 'Reasignar' : 'Asignar'} Fisioterapeuta
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentTherapistId ? 'Reasignar' : 'Asignar'} Fisioterapeuta
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p className="text-gray-600">
                    <strong>Paciente:</strong> {patientName}
                  </p>
                  <p className="text-gray-600 mt-1">
                    <strong>Fecha y hora:</strong> {appointmentTime}
                  </p>
                </div>

                <TherapistSelect
                  name="therapist_id"
                  required
                  defaultValue={currentTherapistId}
                  onValueChange={setTherapistId}
                />

                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAssignTherapist}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Save size={16} />
                    {isLoading ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
