'use client'

import { PatientList } from '@/components/patients/PatientList'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Patient } from '@/types/patient'
import { Can } from '@/components/auth/Can'

interface PatientsPageContentProps {
    initialPatients: Patient[]
}

export function PatientsPageContent({ initialPatients }: PatientsPageContentProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
                    <p className="text-gray-600 text-sm mt-1">Gestiona los expedientes de tu clínica.</p>
                </div>
                <Can permission="patients:create">
                    <Link href="/dashboard/pacientes/nuevo">
                        <Button className="gap-2">
                            <Plus size={18} />
                            Nuevo Paciente
                        </Button>
                    </Link>
                </Can>
            </div>

            <PatientList initialPatients={initialPatients} />
        </div>
    )
}
