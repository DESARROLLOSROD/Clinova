'use client'

import { PatientList } from '@/components/patients/PatientList'
import Link from 'next/link'
import { Plus, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Patient } from '@/types/patient'
import { Can } from '@/components/auth/Can'
import { exportToExcel, exportToPdf } from '@/lib/exportUtils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PatientsPageContentProps {
    initialPatients: Patient[]
}

export function PatientsPageContent({ initialPatients }: PatientsPageContentProps) {

    const exportColumns = [
        { header: 'Nombre', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Teléfono', key: 'phone', width: 20 },
        { header: 'Estado', key: 'status', width: 15 },
        { header: 'Fecha Registro', key: 'date', width: 20 },
    ]

    const handleExportExcel = async () => {
        const data = initialPatients.map(p => ({
            name: `${p.first_name} ${p.last_name}`,
            email: p.email || 'N/A',
            phone: p.phone || 'N/A',
            status: p.active ? 'Activo' : 'Inactivo',
            date: new Date(p.created_at).toLocaleDateString('es-ES')
        }))
        await exportToExcel(data, exportColumns, `Pacientes_${new Date().toISOString().split('T')[0]}`)
    }

    const handleExportPdf = () => {
        const data = initialPatients.map(p => ({
            name: `${p.first_name} ${p.last_name}`,
            email: p.email || 'N/A',
            phone: p.phone || 'N/A',
            status: p.active ? 'Activo' : 'Inactivo',
            date: new Date(p.created_at).toLocaleDateString('es-ES')
        }))
        exportToPdf(data, exportColumns, `Pacientes_${new Date().toISOString().split('T')[0]}`, 'Directorio de Pacientes')
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pacientes</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Gestiona los expedientes de tu clínica.</p>
                </div>
                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Download size={16} />
                                Exportar
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                                <FileSpreadsheet size={16} className="text-green-600" /> Excel (.xlsx)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportPdf} className="gap-2 cursor-pointer">
                                <FileText size={16} className="text-red-600" /> PDF (.pdf)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Can permission="patients:create">
                        <Link href="/dashboard/pacientes/nuevo">
                            <Button className="gap-2">
                                <Plus size={18} />
                                Nuevo Paciente
                            </Button>
                        </Link>
                    </Can>
                </div>
            </div>

            <PatientList initialPatients={initialPatients} />
        </div>
    )
}
