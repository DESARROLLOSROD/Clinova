import { createClient } from '@/utils/supabase/server';
import { SessionList } from '@/components/sessions/SessionList';

export const dynamic = 'force-dynamic';

export default async function SessionsPage() {
  const supabase = await createClient();

  // Fetch all sessions with patient and therapist information
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select(
      `
      *,
      patient:patients(id, first_name, last_name, email),
      therapist:therapists(id, first_name, last_name),
      appointment:appointments(appointment_date, appointment_time)
    `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
  }

  // Fetch unique patients for filter
  const { data: patients } = await supabase
    .from('patients')
    .select('id, first_name, last_name')
    .order('first_name');

  // Fetch unique therapists for filter
  const { data: therapists } = await supabase
    .from('therapists')
    .select('id, first_name, last_name')
    .order('first_name');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sesiones Clínicas</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Historial completo de sesiones y notas SOAP
          </p>
        </div>
      </div>

      <SessionList
        initialSessions={sessions || []}
        patients={patients || []}
        therapists={therapists || []}
      />
    </div>
  );
}
