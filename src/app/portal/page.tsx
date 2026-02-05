import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Activity, Dumbbell, TrendingUp } from 'lucide-react';
import { ProgressChart } from '@/components/portal/ProgressChart';
import { PaymentButton } from '@/components/portal/PaymentButton';
import { LogoutButton } from '@/components/portal/LogoutButton';

export default async function PortalDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Check if user is linked to a patient
    const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

    if (!patient) {
        // If user is not a patient, generic message or redirect
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Acceso Restringido</h1>
                <p className="text-gray-600">Este portal es exclusivo para pacientes.</p>
            </div>
        );
    }

    // Fetch upcoming appointment
    const { data: nextAppointment } = await supabase
        .from('appointments')
        .select('*, clinics(name, address), clinic_services(price)')
        .eq('patient_id', patient.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1)
        .single();

    // Fetch session history for progress mainly pain level
    const { data: sessions } = await supabase
        .from('sessions')
        .select('created_at, pain_level')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: true });

    const chartData = sessions?.map(s => ({
        date: new Date(s.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
        pain: s.pain_level
    })) || [];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <header className="mb-8 flex justify-between items-center max-w-5xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Hola, {patient.first_name}</h1>
                    <p className="text-slate-600">Bienvenido a tu portal de salud.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                        Paciente
                    </div>
                    <LogoutButton />
                </div>
            </header>

            <main className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">
                {/* Next Appointment */}
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                            <Calendar className="text-blue-500" />
                            Próxima Cita
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {nextAppointment ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {new Date(nextAppointment.start_time).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                    <p className="text-xl text-blue-600">
                                        {new Date(nextAppointment.start_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-slate-500 pt-2 border-t mt-2">
                                        {nextAppointment.clinics?.name} - {nextAppointment.clinics?.address}
                                    </p>
                                </div>

                                <div className="pt-2">
                                    {/* Payment Status Logic */}
                                    {/* We need to fetch the price from the service or fallback */}
                                    {/* For now, assuming standard price or fetching from joined service */}
                                    <PaymentButton
                                        appointmentId={nextAppointment.id}
                                        amount={nextAppointment.clinic_services?.price || 500}
                                        disabled={nextAppointment.payment_status === 'paid'}
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500">No tienes citas programadas.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Progress Chart */}
                <Card className="md:row-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                            <TrendingUp className="text-green-500" />
                            Tu Progreso
                        </CardTitle>
                        <CardDescription>Evolución del nivel de dolor registrado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProgressChart data={chartData} />
                    </CardContent>
                </Card>

                {/* Action Buttons / Quick Links */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                            <Activity className="text-purple-500" />
                            Acciones Rápidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <button className="w-full text-left p-3 rounded-lg bg-white border hover:bg-slate-50 transition-colors flex items-center justify-between group">
                            <span className="font-medium text-slate-700">Ver mis ejercicios</span>
                            <Dumbbell size={18} className="text-slate-400 group-hover:text-purple-500" />
                        </button>
                        <button className="w-full text-left p-3 rounded-lg bg-white border hover:bg-slate-50 transition-colors flex items-center justify-between group">
                            <span className="font-medium text-slate-700">Contactar Fisioterapeuta</span>
                            < Activity size={18} className="text-slate-400 group-hover:text-purple-500" />
                        </button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
