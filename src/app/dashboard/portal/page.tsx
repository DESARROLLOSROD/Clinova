'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Dumbbell, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
    const [loading, setLoading] = useState(true);
    const [patientName, setPatientName] = useState('');
    const [nextAppointment, setNextAppointment] = useState<any>(null);
    const [pendingExercises, setPendingExercises] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Patient Info
            const { data: patient } = await supabase
                .from('patients')
                .select('first_name, id')
                .eq('auth_user_id', user.id)
                .single();

            if (patient) {
                setPatientName(patient.first_name);

                // Fetch Next Appointment
                const { data: appointments } = await supabase
                    .from('appointments')
                    .select('*')
                    .eq('patient_id', patient.id)
                    .gte('start_time', new Date().toISOString())
                    .order('start_time', { ascending: true })
                    .limit(1);

                if (appointments && appointments.length > 0) {
                    setNextAppointment(appointments[0]);
                }

                // Fetch Active Prescriptions Count
                const { count } = await supabase
                    .from('patient_exercise_prescriptions')
                    .select('*', { count: 'exact', head: true })
                    .eq('patient_id', patient.id)
                    .eq('status', 'active');

                setPendingExercises(count || 0);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hola, {patientName} 👋</h1>
                <p className="text-gray-600">Bienvenido a tu portal de salud.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Next Appointment Card */}
                <Card className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Próxima Visita</p>
                            {nextAppointment ? (
                                <>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {new Date(nextAppointment.start_time).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long'
                                        })}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2 text-blue-600">
                                        <Clock size={18} />
                                        <span className="font-medium">
                                            {new Date(nextAppointment.start_time).toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="py-2">
                                    <p className="text-gray-900 font-medium">No tienes citas programadas</p>
                                    <p className="text-sm text-gray-500">Contacta a la clínica para agendar.</p>
                                </div>
                            )}
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <Calendar className="text-blue-600" size={24} />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link href="/dashboard/portal/appointments">
                            <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 justify-between group">
                                Ver todas mis citas
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </Card>

                {/* Exercises Card */}
                <Card className="p-6 border-l-4 border-l-purple-500">
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
            </div>

            {/* Quick Tips or Announcements could go here */}
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
