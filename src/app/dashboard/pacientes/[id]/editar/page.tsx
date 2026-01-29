import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PatientEditForm } from '@/components/patients/PatientEditForm'

export const dynamic = 'force-dynamic'

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !patient) {
        notFound()
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/pacientes/${id}`}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Volver
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Paciente</h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Actualiza los datos de {patient.first_name} {patient.last_name}
                </p>
            </div>

            <PatientEditForm patient={patient} />
        </div>
    )
}
