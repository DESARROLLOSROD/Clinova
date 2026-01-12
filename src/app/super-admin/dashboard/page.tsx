'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface PlatformStats {
    totalClinics: number
    activeClinics: number
    totalUsers: number
    totalRevenue: number
    clinicsOnTrial: number
}

interface Clinic {
    id: string
    name: string
    subscription_status: string
    subscription_tier: string
    created_at: string
    _count: {
        users: number
        patients: number
    }
}

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<PlatformStats | null>(null)
    const [recentClinics, setRecentClinics] = useState<Clinic[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    async function fetchDashboardData() {
        try {
            // Fetch all clinics
            const { data: clinics, error: clinicsError } = await supabase
                .from('clinics')
                .select('*')
                .order('created_at', { ascending: false })

            if (clinicsError) throw clinicsError

            // Calculate stats
            const totalClinics = clinics?.length || 0
            const activeClinics = clinics?.filter(c => c.subscription_status === 'active').length || 0
            const clinicsOnTrial = clinics?.filter(c => c.subscription_status === 'trial').length || 0

            // Fetch total users count
            const { count: totalUsers } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true })

            // Get recent clinics with user and patient counts
            const recentClinicsData = await Promise.all(
                (clinics || []).slice(0, 5).map(async (clinic) => {
                    const { count: userCount } = await supabase
                        .from('user_profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('clinic_id', clinic.id)

                    const { count: patientCount } = await supabase
                        .from('patients')
                        .select('*', { count: 'exact', head: true })
                        .eq('clinic_id', clinic.id)

                    return {
                        ...clinic,
                        _count: {
                            users: userCount || 0,
                            patients: patientCount || 0,
                        },
                    }
                })
            )

            setStats({
                totalClinics,
                activeClinics,
                totalUsers: totalUsers || 0,
                totalRevenue: 0, // TODO: Calculate from Stripe
                clinicsOnTrial,
            })

            setRecentClinics(recentClinicsData)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Panel de Super Administrador</h1>
                <p className="text-gray-600 mt-2">Vista general de la plataforma Clinova</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Clínicas</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalClinics}</p>
                            <p className="text-sm text-green-600 mt-1">{stats?.activeClinics} activas</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers}</p>
                            <p className="text-sm text-gray-500 mt-1">En todas las clínicas</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Users className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">En Período de Prueba</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.clinicsOnTrial}</p>
                            <p className="text-sm text-orange-600 mt-1">Clínicas trial</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <TrendingUp className="h-8 w-8 text-orange-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">${stats?.totalRevenue}</p>
                            <p className="text-sm text-gray-500 mt-1">MXN/mes</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <DollarSign className="h-8 w-8 text-purple-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Clinics */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Clínicas Recientes</h2>
                    <Link
                        href="/super-admin/clinics"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        Ver todas →
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Clínica</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Plan</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Usuarios</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Pacientes</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Creada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentClinics.map((clinic) => (
                                <tr key={clinic.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <Link
                                            href={`/super-admin/clinics/${clinic.id}`}
                                            className="font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            {clinic.name}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${clinic.subscription_status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : clinic.subscription_status === 'trial'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {clinic.subscription_status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 capitalize">{clinic.subscription_tier}</td>
                                    <td className="py-3 px-4">{clinic._count.users}</td>
                                    <td className="py-3 px-4">{clinic._count.patients}</td>
                                    <td className="py-3 px-4 text-gray-600">
                                        {new Date(clinic.created_at).toLocaleDateString('es-MX')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
