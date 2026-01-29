'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Dumbbell, Clock, ArrowRight, User, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';

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
    } | null;
}

export default function PatientDashboard() {
    const { user, loading: authLoading } = useUser();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [patientName, setPatientName] = useState('');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [pendingExercises, setPendingExercises] = useState(0);
    const supabase = createClient();

    const fetchDashboardData = async (userId: string) => {
        try {
            setError(null);

            const { data: patient, error: patientError } = await supabase
                .from('patients')
                .select('first_name, id')
                .eq('auth_user_id', userId)
                .single();

            if (patientError) {
                console.error('Patient query error:', patientError);
                setError('No se encontró el perfil de paciente asociado a tu cuenta.');
                return;
            }

            if (patient) {
                setPatientName(patient.first_name);

                const { data: appointmentsData } = await supabase
                    .from('appointments')
                    .select(`
                        *,
                        therapist:therapists(first_name, last_name),
                        clinic:clinics(name, address)
                    `)
                    .eq('patient_id', patient.id)
                    .order('start_time', { ascending: true });

                setAppointments(appointmentsData || []);

                const { count } = await supabase
                    .from('patient_exercise_prescriptions')
                    .select('*', { count: 'exact', head: true })
                    .eq('patient_id', patient.id)
                    .eq('status', 'active');

                setPendingExercises(count || 0);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            setError('Error al cargar los datos. Intenta recargar la página.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Independent initialization to bypass UserContext potential hangs
        const initDashboard = async () => {
            try {
                // If we already have a user from context, use it.
                // But if context is loading (authLoading=true), we don't wait. We check session directly.
                let currentUserId = user?.id;

                if (!currentUserId) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        window.location.href = '/login';
                        return;
                    }
                    currentUserId = session.user.id;
                }

                await fetchDashboardData(currentUserId);
            } catch (err) {
                console.error("Dashboard init error:", err);
                setError('Error al inicializar el portal.');
                setLoading(false);
            }
        };

        // Safety timeout
        const timer = setTimeout(() => {
            if (loading) {
                setLoading(false);
                setError('La carga está tardando demasiado. Por favor recarga la página.');
            }
        }, 8000);

        initDashboard();

        return () => clearTimeout(timer);
    }, [user?.id]); // Only re-run if ID specifically changes

    if (error) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error de Carga</h3>
                <p className="text-gray-600 mb-6 max-w-md">{error}</p>
                <div className="flex gap-4">
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Recargar Página
                    </Button>
                    <Link href="/login">
                        <Button variant="ghost" className="text-blue-600">
                            Volver al Inicio
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Only block on LOCAL loading. Ignore authLoading to prevent context hangs.
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 text-sm">Cargando portal...</p>
            </div>
        );
    }

    const now = new Date();
    const upcomingAppointments = appointments.filter(a => new Date(a.start_time) >= now);
    const pastAppointments = appointments.filter(a => new Date(a.start_time) < now).reverse();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hola, {patientName} 👋</h1>
                <p className="text-gray-600">Bienvenido a tu portal de salud.</p>
            </div>

            {/* Exercises Card */}
            <Card className="p-6 border-l-4 border-l-purple-500 bg-white text-gray-900">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Mi Plan de Ejercicios</p>
                        <h3 className="text-xl font-bold text-gray-900">{pendingExercises} Ejercicios Activos</h3>
                        <p className="text-sm text-gray-500 mt-1">Mantén tu racha de recuperación</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <Dumbbell className="text-purple-600" size={24} />
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link href="/dashboard/portal/exercises">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-between group">
                            Ir a mis ejercicios
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </Card>

            {/* Upcoming Appointments */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={20} />
                    Próximas Citas
                </h2>
                {upcomingAppointments.length > 0 ? (
                    <div className="space-y-3">
                        {upcomingAppointments.map(appointment => (
                            <Card key={appointment.id} className="p-5 border-l-4 border-l-blue-500 bg-white text-gray-900">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">
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
                                    <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold
                                        ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
                                    `}>
                                        {appointment.status === 'scheduled' ? 'Programada' :
                                            appointment.status === 'completed' ? 'Completada' :
                                                appointment.status === 'cancelled' ? 'Cancelada' : appointment.status}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
                        <AlertCircle className="mx-auto h-10 w-10 text-blue-400 mb-2" />
                        <p className="text-blue-900 font-medium">No tienes citas próximas</p>
                        <p className="text-blue-700 text-sm mt-1">Contacta a la clínica para agendar una nueva visita.</p>
                    </div>
                )}
            </div>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700">Historial de Citas</h2>
                    <div className="space-y-3 opacity-75">
                        {pastAppointments.slice(0, 5).map(appointment => (
                            <Card key={appointment.id} className="p-4 border-l-4 border-l-gray-300 bg-gray-50 text-gray-900">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-700">
                                            {appointment.title || 'Consulta de Fisioterapia'}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                <span>
                                                    {new Date(appointment.start_time).toLocaleDateString('es-ES', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} />
                                                <span>
                                                    {new Date(appointment.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {appointment.therapist && (
                                                <div className="flex items-center gap-1.5">
                                                    <User size={14} />
                                                    <span>Dr. {appointment.therapist.first_name} {appointment.therapist.last_name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold
                                        ${appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                appointment.status === 'no_show' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}
                                    `}>
                                        {appointment.status === 'completed' ? 'Completada' :
                                            appointment.status === 'cancelled' ? 'Cancelada' :
                                                appointment.status === 'no_show' ? 'No asistió' : appointment.status}
                                    </span>
                                </div>
                            </Card>
                        ))}
                        {pastAppointments.length > 5 && (
                            <Link href="/dashboard/portal/appointments">
                                <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-700">
                                    Ver todas las citas ({pastAppointments.length})
                                    <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <h3 className="text-lg font-bold mb-2">¿Tienes dudas sobre tu tratamiento?</h3>
                <p className="text-blue-100 mb-4 text-sm max-w-lg">
                    Recuerda que puedes consultar los documentos compartidos por tu fisioterapeuta o revisar los videos de tus ejercicios.
                </p>
                <Link href="/dashboard/portal/documents">
                    <Button variant="secondary" size="sm" className="bg-white text-blue-600 hover:bg-blue-50 border-none">
                        Ver Documentos
                    </Button>
                </Link>
            </div>
        </div>
    );
}
