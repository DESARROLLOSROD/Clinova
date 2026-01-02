
import { createClient } from '@/utils/supabase/server'
import { PatientList } from '@/components/patients/PatientList'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function PacientesPage() {
    const supabase = await createClient()

    // Fetch patients sorted by creation date
    const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching patients:', error)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
                    <p className="text-gray-600 text-sm mt-1">Gestiona los expedientes de tu clínica.</p>
                </div>
                <Link href="/dashboard/pacientes/nuevo">
                    <Button className="gap-2">
                        <Plus size={18} />
                        Nuevo Paciente
                    </Button>
                </Link>
            </div>

            <PatientList initialPatients={patients || []} />
        </div>
    )
}
