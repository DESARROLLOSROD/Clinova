'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [formData, setFormData] = useState({
    patient_id: '',
    title: '',
    start_time: '',
    end_time: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'no_show',
    notes: '',
  });

  useEffect(() => {
    fetchPatients();
    fetchAppointment();
  }, [appointmentId]);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .eq('active', true)
      .order('last_name');

    if (data) {
      setPatients(data);
    }
  };

  const fetchAppointment = async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (error) {
      console.error('Error fetching appointment:', error);
      alert('Error al cargar la cita');
      router.push('/dashboard/agenda');
      return;
    }

    if (data) {
      setFormData({
        patient_id: data.patient_id,
        title: data.title,
        start_time: new Date(data.start_time).toISOString().slice(0, 16),
        end_time: new Date(data.end_time).toISOString().slice(0, 16),
        status: data.status,
        notes: data.notes || '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          patient_id: formData.patient_id,
          title: formData.title,
          start_time: formData.start_time,
          end_time: formData.end_time,
          status: formData.status,
          notes: formData.notes || null,
        })
        .eq('id', appointmentId);

      if (error) throw error;

      router.push('/dashboard/agenda');
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error al actualizar la cita');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      return;
    }

    setDeleting(true);

    try {
      const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);

      if (error) throw error;

      router.push('/dashboard/agenda');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error al eliminar la cita');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/agenda">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Volver a Agenda
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Cita</h1>
        <p className="text-gray-600 mt-2">Modifica los detalles de la cita</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paciente *</label>
            <select
              required
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.last_name}, {patient.first_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cita / Título *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Sesión de Fisioterapia"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y Hora de Inicio *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y Hora de Fin *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'scheduled' | 'completed' | 'cancelled' | 'no_show',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scheduled">Programada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
              <option value="no_show">No asistió</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales sobre la cita..."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            <Trash2 size={18} />
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
          <Link href="/dashboard/agenda" className="flex-shrink-0">
            <button
              type="button"
              className="py-3 px-6 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
