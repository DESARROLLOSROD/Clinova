'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { CalendarView } from './CalendarView'
import { Appointment } from '@/types/appointment'
import { format } from 'date-fns'

interface AgendaClientWrapperProps {
    appointments: Appointment[]
    currentDate: Date
}

export function AgendaClientWrapper({ appointments, currentDate }: AgendaClientWrapperProps) {
    const router = useRouter()

    const handleDateChange = (newDate: Date) => {
        // Update the URL with the new date
        const dateString = format(newDate, 'yyyy-MM-dd')
        router.push(`/dashboard/agenda?date=${dateString}`)
    }

    const handleAppointmentClick = (appointment: Appointment) => {
        // Navigate to create session if not completed
        if (appointment.status === 'scheduled') {
            router.push(`/dashboard/sesiones/nueva?appointment_id=${appointment.id}`)
        }
    }

    return (
        <CalendarView
            appointments={appointments}
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onAppointmentClick={handleAppointmentClick}
        />
    )
}
