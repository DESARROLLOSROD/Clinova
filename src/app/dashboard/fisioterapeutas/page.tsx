import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TherapistList } from '@/components/therapists/TherapistList';

export const dynamic = 'force-dynamic';

export default async function FisioterapeutasPage() {
  const supabase = await createClient();

  // Fetch therapists with patient count
  const { data: therapists, error } = await supabase
    .from('therapists')
    .select(`
      *,
      therapist_patient_assignments!therapist_id(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching therapists:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fisioterapeutas</h1>
          <p className="text-gray-600 text-sm mt-1">
            Gestiona el equipo de fisioterapeutas de tu clínica.
          </p>
        </div>
        <Link href="/dashboard/fisioterapeutas/nuevo">
          <Button className="gap-2">
            <Plus size={18} />
            Nuevo Fisioterapeuta
          </Button>
        </Link>
      </div>

      <TherapistList initialTherapists={therapists || []} />
    </div>
  );
}
