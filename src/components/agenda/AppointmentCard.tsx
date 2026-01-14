'use client';

import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import Link from 'next/link';

interface AppointmentCardProps {
    appointment: Appointment;
    onClick?: (appointment: Appointment) => void;
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
    const statusColors = {
        scheduled: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
        completed: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50',
        cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50',
        no_show: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50',
    };

    return (
        <Link href={`/dashboard/agenda/${appointment.id}/editar`}>
            <div
                className={`absolute inset-x-1 rounded px-2 py-1 text-xs border cursor-pointer hover:opacity-90 hover:shadow-md overflow-hidden transition-all ${statusColors[appointment.status]}`}
            >
                <div className="font-semibold truncate">
                    {appointment.patients?.first_name} {appointment.patients?.last_name}
                </div>
                <div className="truncate opacity-75">
                    {format(new Date(appointment.start_time), 'h:mm a')}
                </div>
                <div className="truncate text-[10px] opacity-60 mt-0.5">
                    {appointment.title}
                </div>
            </div>
        </Link>
    );
}
