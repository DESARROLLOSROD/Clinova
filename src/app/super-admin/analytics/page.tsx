'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Building2, Users, Calendar, TrendingUp, AlertTriangle } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        totalClinics: 0,
        activeClinics: 0,
        totalUsers: 0,
        totalPatients: 0,
        totalAppointments: 0,
        clinicsGrowth: [] as any[],
        appointmentsByMonth: [] as any[]
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchAnalytics()
    }, [])

    async function fetchAnalytics() {
        try {
            // Parallelize fetching counts
            const [
                clinicsResponse,
                usersResponse,
                patientsResponse,
                appointmentsResponse
            ] = await Promise.all([
                supabase.from('clinics').select('created_at, is_active'),
                supabase.from('user_profiles').select('created_at', { count: 'exact', head: true }),
                supabase.from('patients').select('created_at', { count: 'exact', head: true }),
                supabase.from('appointments').select('created_at', { count: 'exact', head: true })
            ])

            const clinics = clinicsResponse.data || []

            // Process growth data (mock for now since we need aggregation query or processing)
            // In a real scenario we would optimize this with RPC calls or better queries
            const clinicsByMonth = processGrowthData(clinics)

            setStats({
                totalClinics: clinics.length,
                activeClinics: clinics.filter(c => c.is_active).length,
                totalUsers: usersResponse.count || 0,
                totalPatients: patientsResponse.count || 0,
                totalAppointments: appointmentsResponse.count || 0,
                clinicsGrowth: clinicsByMonth,
                appointmentsByMonth: [] // Would implementation similar processing
            })

        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    // Helper to group data by month
    function processGrowthData(data: any[]) {
        // Determine range (last 6 months)
        const months = []
        const today = new Date()
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
            months.push({
                date: d,
                label: d.toLocaleString('es-MX', { month: 'short' }),
                count: 0
            })
        }

        // This is a naive client-side aggregation. For production with huge data, move to DB.
        // For specific requirement "metrics of platform", this is a starting point.
        return months.map(m => {
            // Find items created in this month (cumulative or new? Let's do cumulative for growth)
            const count = data.filter(item => {
                const itemDate = new Date(item.created_at)
                return itemDate < new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0)
            }).length
            return { ...m, count }
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analíticas de la Plataforma</h1>
            <p className="text-gray-600 mb-8">Métricas clave de rendimiento y crecimiento de Clinova</p>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Clínicas</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalClinics}</h3>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>{stats.activeClinics} activas</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Usuarios Totales</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Staff clínico y administrativo
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pacientes</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalPatients}</h3>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Total histórico registrados
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Calendar className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Citas Totales</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</h3>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Agendadas en plataforma
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Growth Chart */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Crecimiento de Clínicas</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.clinicsGrowth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    name="Clínicas Totales"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Future Chart Placeholder */}
                <Card className="p-6 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <AlertTriangle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Más métricas pronto</h3>
                    <p className="text-gray-500 max-w-sm">
                        Estamos integrando datos de uso detallados y métricas financieras de Stripe para mostrar aquí.
                    </p>
                </Card>
            </div>
        </div>
    )
}
