'use client'

import React from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportToExcel, exportToPdf } from '@/lib/exportUtils'
import { Appointment } from '@/types/appointment'

interface AgendaExportButtonsProps {
    appointments: any[] // Using any[] to avoid strict type issues with joins for now, or use Appointment type if fully compatible
}

export function AgendaExportButtons({ appointments }: AgendaExportButtonsProps) {

    const exportColumns = [
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Hora', key: 'time', width: 15 },
        { header: 'Paciente', key: 'patient', width: 25 },
        { header: 'Título', key: 'title', width: 25 },
        { header: 'Estado', key: 'status', width: 15 },
    ]

    const handleExportExcel = async () => {
        const data = appointments.map(app => ({
            date: new Date(app.start_time).toLocaleDateString('es-ES'),
            time: new Date(app.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            patient: app.patients ? `${app.patients.first_name} ${app.patients.last_name}` : 'N/A',
            title: app.title,
            status: app.status === 'completed' ? 'Completada' :
                app.status === 'scheduled' ? 'Programada' :
                    app.status === 'cancelled' ? 'Cancelada' : 'No asistió'
        }))
        await exportToExcel(data, exportColumns, `Agenda_${new Date().toISOString().split('T')[0]}`)
    }

    const handleExportPdf = () => {
        const data = appointments.map(app => ({
            date: new Date(app.start_time).toLocaleDateString('es-ES'),
            time: new Date(app.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            patient: app.patients ? `${app.patients.first_name} ${app.patients.last_name}` : 'N/A',
            title: app.title,
            status: app.status === 'completed' ? 'Completada' :
                app.status === 'scheduled' ? 'Programada' :
                    app.status === 'cancelled' ? 'Cancelada' : 'No asistió'
        }))
        exportToPdf(data, exportColumns, `Agenda_${new Date().toISOString().split('T')[0]}`, 'Agenda de Citas')
    }

    return (
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
    )
}
