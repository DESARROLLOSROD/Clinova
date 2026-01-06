import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { AppointmentEditForm } from '@/components/appointments/AppointmentEditForm';

export default async function EditAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch appointment with patient and therapist details
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (
        id,
        first_name,
        last_name,
        email
      ),
      therapists (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error || !appointment) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Cita</h1>
        <p className="text-gray-600 text-sm">
          Modifica los detalles de la cita y asigna fisioterapeuta
        </p>
      </div>

      <AppointmentEditForm appointment={appointment} />
    </div>
  );
}
