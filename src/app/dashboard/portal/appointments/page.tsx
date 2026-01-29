'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Calendar, Clock, MapPin, User, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Appointment {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    status: string;
    therapist: {
        first_name: string;
        last_name: string;
    } | null;
    clinic: {
        name: string;
        address: string;
    }
}

export default function PortalAppointmentsPage() {
    const supabase = createClient();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: patient } = await supabase
                .from('patients')
                .select('id')
                .eq('auth_user_id', user.id)
                .single();

            if (!patient) return;

            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          therapist:therapists(first_name, last_name),
          clinic:clinics(name, address)
        `)
                .eq('patient_id', patient.id)
                .order('start_time', { ascending: false }); // Most recent first (future ones will be at top if we filter)

            if (error) throw error;
            setAppointments(data || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Cargando citas...</p>
            </div>
        );
    }

    const upcomingAppointments = appointments.filter(a => new Date(a.start_time) >= new Date());
    const pastAppointments = appointments.filter(a => new Date(a.start_time) < new Date());

    const AppointmentCard = ({ appointment, isPast = false }: { appointment: Appointment, isPast?: boolean }) => (
        <Card className={`p-5 border-l-4 text-gray-900 ${isPast ? 'border-l-gray-300 bg-gray-50' : 'border-l-blue-500 bg-white'}`}>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h3 className={`font-bold text-lg ${isPast ? 'text-gray-700' : 'text-gray-900'}`}>
                        {appointment.title || 'Consulta de Fisioterapia'}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={16} className="text-blue-600" />
                            <span>
                                {new Date(appointment.start_time).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={16} className="text-blue-600" />
                            <span>
                                {new Date(appointment.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="mt-3 space-y-1">
                        {appointment.therapist && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User size={16} />
                                <span>Dr. {appointment.therapist.first_name} {appointment.therapist.last_name}</span>
                            </div>
                        )}
                        {appointment.clinic && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin size={16} />
                                <span>{appointment.clinic.name} - {appointment.clinic.address}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
            `}>
                        {appointment.status === 'scheduled' ? 'Programada' :
                            appointment.status === 'completed' ? 'Completada' : appointment.status}
                    </span>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Citas</h1>
                <p className="text-gray-600">Historial y próximas visitas</p>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="text-blue-600" />
                    Próximas Citas
                </h2>
                {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map(app => (
                        <AppointmentCard key={app.id} appointment={app} />
                    ))
                ) : (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
                        <AlertCircle className="mx-auto h-10 w-10 text-blue-400 mb-2" />
                        <p className="text-blue-900 font-medium">No tienes citas próximas</p>
                        <p className="text-blue-700 text-sm mt-1">Contacta a la clínica para agendar una nueva visita.</p>
                    </div>
                )}
            </div>

            {pastAppointments.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700">Historial</h2>
                    <div className="space-y-4 opacity-75">
                        {pastAppointments.map(app => (
                            <AppointmentCard key={app.id} appointment={app} isPast={true} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
