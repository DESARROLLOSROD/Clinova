import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Calendar, DollarSign, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { StatsCharts } from '@/components/dashboard/StatsCharts'
import { StaggerContainer, StaggerItem, FadeIn } from '@/components/ui/motion-containers'
import { DateRangeSelector } from '@/components/dashboard/DateRangeSelector'
import { startOfMonth, endOfDay, startOfDay, eachDayOfInterval, format, parseISO, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

interface DashboardPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage(props: DashboardPageProps) {
    const searchParams = await props.searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Date Filters
    const now = new Date()
    const fromParam = searchParams.from as string
    const toParam = searchParams.to as string

    const fromDate = fromParam ? new Date(fromParam) : startOfMonth(now)
    const toDate = toParam ? new Date(toParam) : endOfDay(now)

    const fromISO = fromDate.toISOString()
    const toISO = toDate.toISOString()

    const todayStart = startOfDay(now).toISOString()
    const todayEnd = endOfDay(now).toISOString()

    // Parallelize data fetching
    const [
        { count: activePatientsCount },
        { count: inactivePatientsCount },
        { count: todayAppointmentsCount },
        { data: periodPayments },
        { data: pendingPayments },
        { data: periodSessions },
        { count: totalSessionsCount },
        { data: recentAppointments }
    ] = await Promise.all([
        // 1. Active Patients
        supabase.from('patients').select('*', { count: 'exact', head: true }).eq('active', true),
        // 2. Inactive Patients
        supabase.from('patients').select('*', { count: 'exact', head: true }).eq('active', false),
        // 3. Appointments Today
        supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('start_time', todayStart).lte('start_time', todayEnd),
        // 4. Revenue in Range
        supabase.from('payments').select('amount, payment_date').eq('status', 'completed').gte('payment_date', fromISO).lte('payment_date', toISO).order('payment_date', { ascending: true }),
        // 5. Pending Payments
        supabase.from('payments').select('amount').eq('status', 'pending'),
        // 6. Sessions in Range (using count instead of fetching all data if just length is needed, but we iterate for chart map)
        // Wait, for chart map we iterate over dates.
        // Original code: fetched periodSessions to get count AND iterate for chart.
        // So we need data here, not just count.
        supabase.from('sessions').select('created_at').gte('created_at', fromISO).lte('created_at', toISO).order('created_at', { ascending: true }),
        // 7. Total Sessions
        supabase.from('sessions').select('*', { count: 'exact', head: true }),
        // 8. Recent Appointments
        supabase.from('appointments').select(`
            id,
            title,
            start_time,
            status,
            patients (first_name, last_name)
        `).order('created_at', { ascending: false }).limit(5)
    ])

    const periodRevenue = periodPayments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const pendingAmount = pendingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const periodSessionsCount = periodSessions?.length || 0
    // supabase.from().select() returns { data, error, count, status, statusText }
    // My destructing above assumes structure.
    // { count: activePatientsCount } comes from result.
    // { data: periodPayments } comes from result.
    // { count: periodSessionsCount } -> Wait, I changed query 6 to fetch data?
    // Original: const { data: periodSessions } = ...
    // My Promise.all index 5: select('created_at') returns DATA.
    // So distinct variable names is better.


    // --- Data Aggregation for Charts ---

    const daysInterval = eachDayOfInterval({ start: fromDate, end: toDate })
    const daysCount = daysInterval.length
    const isLargeRange = daysCount > 60

    const formatDateKey = (date: Date) => {
        return format(date, 'yyyy-MM-dd')
    }

    const formatDisplayLabel = (date: Date) => {
        return format(date, isLargeRange ? 'MMM yyyy' : 'd MMM', { locale: es })
    }

    const chartMap = new Map<string, { sessions: number, revenue: number, date: Date, label: string }>()

    daysInterval.forEach(day => {
        const key = formatDateKey(day)
        chartMap.set(key, { sessions: 0, revenue: 0, date: day, label: formatDisplayLabel(day) })
    })

    periodPayments?.forEach(p => {
        const date = parseISO(p.payment_date)
        const key = formatDateKey(date)
        if (chartMap.has(key)) {
            const entry = chartMap.get(key)!
            entry.revenue += p.amount
        }
    })

    periodSessions?.forEach(s => {
        const date = parseISO(s.created_at)
        const key = formatDateKey(date)
        if (chartMap.has(key)) {
            const entry = chartMap.get(key)!
            entry.sessions += 1
        }
    })

    const chartData = Array.from(chartMap.values()).map(entry => ({
        name: entry.label,
        sessions: entry.sessions,
        revenue: entry.revenue
    }))

    const sessionsChartData = chartData.map(d => ({ name: d.name, value: d.sessions }))
    const revenueChartData = chartData.map(d => ({ name: d.name, value: d.revenue }))

    const patientDistributionData = [
        { name: 'Activos', value: activePatientsCount || 0, fill: '#3b82f6' },
        { name: 'Inactivos', value: inactivePatientsCount || 0, fill: '#94a3b8' },
    ]


    return (
        <div className="transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Resumen General</h2>
                <div className="flex items-center gap-2">
                    <DateRangeSelector />
                </div>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Link href="/dashboard/patients?filter=active" className="block">
                    <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md cursor-pointer h-full">
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
                </Link>

                <Link href="/dashboard/agenda" className="block">
                    <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md cursor-pointer h-full">
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
                </Link>

                <Link href="/dashboard/payments" className="block">
                    <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md cursor-pointer h-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Ingresos (Periodo)</h3>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">${periodRevenue.toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                        </div>
                    </StaggerItem>
                </Link>

                <Link href="/dashboard/payments?status=pending" className="block">
                    <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md cursor-pointer h-full">
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
                </Link>

                <Link href="/dashboard/sessions" className="block">
                    <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md cursor-pointer h-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Sesiones (Periodo)</h3>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{periodSessionsCount || 0}</p>
                            </div>
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                <FileText className="text-indigo-600 dark:text-indigo-400" size={24} />
                            </div>
                        </div>
                    </StaggerItem>
                </Link>

                <StaggerItem className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors h-full">
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
                <StatsCharts
                    sessionsData={sessionsChartData}
                    revenueData={revenueChartData}
                    patientDistribution={patientDistributionData}
                />
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
