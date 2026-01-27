
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Calendar, DollarSign, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { StatsCharts } from '@/components/dashboard/StatsCharts'
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/ui/motion-containers'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch active patients count
    const { count: activePatientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)

    // Fetch today's appointments
    const today = new Date()
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString()
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString()

    const { count: todayAppointmentsCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', todayStart)
        .lte('start_time', todayEnd)

    // Fetch this month's revenue
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
    const { data: monthPayments } = await supabase
        .from('payments')
        .select('amount, status')
        .eq('status', 'completed')
        .gte('payment_date', monthStart)

    const monthlyRevenue = monthPayments?.reduce((sum, p) => sum + p.amount, 0) || 0

    // Fetch pending payments
    const { data: pendingPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending')

    const pendingAmount = pendingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0

    // Fetch total sessions
    const { count: totalSessionsCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })

    // Fetch this month's sessions
    const { count: monthSessionsCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart)

    // Fetch recent appointments for activity
    const { data: recentAppointments } = await supabase
        .from('appointments')
        .select(`
            id,
            title,
            start_time,
            status,
            patients (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

    return (
        <div className="transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Resumen General</h2>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pacientes Activos</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{activePatientsCount || 0}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Users className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                    </div>
                </StaggerItem>

                <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Citas Hoy</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{todayAppointmentsCount || 0}</p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Calendar className="text-purple-600 dark:text-purple-400" size={24} />
                        </div>
                    </div>
                </StaggerItem>

                <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Ingresos (Mes)</h3>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">${monthlyRevenue.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <DollarSign className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                    </div>
                </StaggerItem>

                <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pagos Pendientes</h3>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">${pendingAmount.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <AlertCircle className="text-yellow-600 dark:text-yellow-400" size={24} />
                        </div>
                    </div>
                </StaggerItem>

                <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Sesiones (Mes)</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{monthSessionsCount || 0}</p>
                        </div>
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                    </div>
                </StaggerItem>

                <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Sesiones</h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{totalSessionsCount || 0}</p>
                        </div>
                        <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                            <TrendingUp className="text-teal-600 dark:text-teal-400" size={24} />
                        </div>
                    </div>
                </StaggerItem>
            </StaggerContainer>

            <FadeIn delay={0.4}>
                <StatsCharts />
            </FadeIn>

            <FadeIn delay={0.6} className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Citas Recientes</h3>
                    <Link href="/dashboard/agenda" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors">
                        Ver todas →
                    </Link>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                    {recentAppointments && recentAppointments.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {recentAppointments.map((appointment: any) => (
                                <div key={appointment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {appointment.patients?.first_name} {appointment.patients?.last_name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{appointment.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                {new Date(appointment.start_time).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appointment.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                                appointment.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                                                    appointment.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                                                        'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
                                                }`}>
                                                {appointment.status === 'completed' ? 'Completada' :
                                                    appointment.status === 'scheduled' ? 'Programada' :
                                                        appointment.status === 'cancelled' ? 'Cancelada' :
                                                            'No asistió'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No hay citas registradas
                        </div>
                    )}
                </div>
            </FadeIn>
        </div>
    )
}
