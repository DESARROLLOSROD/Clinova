'use client';

import { Appointment } from '@/types/appointment';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

interface AppointmentCardProps {
    appointment: Appointment;
    onClick?: (appointment: Appointment) => void;
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
    const router = useRouter();

    const statusColors = {
        scheduled: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/50',
        completed: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/50',
        cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50',
        no_show: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/50',
    };

    const handleWhatsAppClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!appointment.patients?.phone) return;

        const patientName = `${appointment.patients.first_name}`;
        const date = format(new Date(appointment.start_time), 'dd/MM');
        const time = format(new Date(appointment.start_time), 'h:mm a');

        const message = `Hola ${patientName}, te recordamos tu cita en Clinova el día ${date} a las ${time}. Por favor confirma tu asistencia. 🩺`;
        const encodedMessage = encodeURIComponent(message);

        window.open(`https://wa.me/${appointment.patients.phone}?text=${encodedMessage}`, '_blank');
    };

    const handleCardClick = () => {
        router.push(`/dashboard/agenda/${appointment.id}/editar`);
    };

    return (
        <div
            onClick={handleCardClick}
            className={`absolute inset-x-1 rounded px-2 py-1 text-xs border cursor-pointer hover:opacity-90 hover:shadow-md overflow-hidden transition-all group ${statusColors[appointment.status]}`}
        >
            <div className="flex justify-between items-start">
                <div className="font-semibold truncate flex-1">
                    {appointment.patients?.first_name} {appointment.patients?.last_name}
                </div>
                {appointment.patients?.phone && (
                    <button
                        onClick={handleWhatsAppClick}
                        className="text-green-600 hover:text-green-800 hover:bg-green-200 p-0.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
                        title="Enviar recordatorio por WhatsApp"
                    >
                        <MessageCircle size={12} fill="currentColor" />
                    </button>
                )}
            </div>
            <div className="truncate opacity-75">
                {format(new Date(appointment.start_time), 'h:mm a')}
            </div>
            <div className="truncate text-[10px] opacity-60 mt-0.5">
                {appointment.title}
            </div>
        </div>
    );
}
