'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2, Mail, Phone, MapPin, Users, Calendar, Activity, Edit2, Archive } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ClinicDetails {
    id: string
    name: string
    slug: string
    email: string | null
    phone: string | null
    city: string | null
    state: string | null
    country: string | null
    subscription_status: string
    subscription_tier: string
    created_at: string
    is_active: boolean
    manager?: {
        full_name: string
        email: string
    }
}

interface Stats {
    users: number
    patients: number
    appointments: number
}

export default function ClinicDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const router = useRouter()
    const supabase = createClient()
    const [clinic, setClinic] = useState<ClinicDetails | null>(null)
    const [stats, setStats] = useState<Stats>({ users: 0, patients: 0, appointments: 0 })
    const [loading, setLoading] = useState(true)
    const [clinicId, setClinicId] = useState<string | null>(null)

    useEffect(() => {
        async function resolveParams() {
            const resolvedParams = await params
            setClinicId(resolvedParams.id)
        }
        resolveParams()
    }, [params])

    useEffect(() => {
        if (clinicId) {
            fetchClinicDetails()
        }
    }, [clinicId])

    async function fetchClinicDetails() {
        if (!clinicId) {
            console.error('No clinic ID available')
            return
        }

        try {
            // 1. Get Clinic Details
            const { data: clinicData, error: clinicError } = await supabase
                .from('clinics')
                .select('*')
                .eq('id', clinicId)
                .single()

            if (clinicError) throw clinicError

            // 2. Get Manager Info
            const { data: managerData } = await supabase
                .from('user_profiles')
                .select('full_name, id') // We can't get email from profiles directly usually, but let's try assuming profiles has it or we get it differently.
                // Wait, user_profiles doesn't have email. We check auth.users usually via RPC or if we stored it.
                // For now let's just show the name.
                .eq('clinic_id', clinicId)
                .eq('role', 'clinic_manager')
                .single()

            setClinic({
                ...clinicData,
                manager: managerData ? { full_name: managerData.full_name, email: '...' } : undefined
            })

            // 3. Get Stats
            const [usersCount, patientsCount, appointmentsCount] = await Promise.all([
                supabase.from('user_profiles').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId),
                supabase.from('patients').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId),
                supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId)
            ])

            setStats({
                users: usersCount.count || 0,
                patients: patientsCount.count || 0,
                appointments: appointmentsCount.count || 0
            })

        } catch (error) {
            console.error('Error fetching clinic details:', error)
            toast.error('Error al cargar los detalles de la clínica')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (newStatus: boolean) => {
        if (!clinicId) return

        try {
            const { error } = await supabase
                .from('clinics')
                .update({ is_active: newStatus })
                .eq('id', clinicId)

            if (error) throw error

            setClinic(prev => prev ? { ...prev, is_active: newStatus } : null)
            toast.success(`Clínica ${newStatus ? 'activada' : 'desactivada'} exitosamente`)
        } catch (error) {
            toast.error('Error al actualizar el estado')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!clinic) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Clínica no encontrada</h2>
                <Link href="/super-admin/clinics" className="text-blue-600 hover:underline mt-4 inline-block">
                    Volver a la lista
                </Link>
            </div>
        )
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <Link href="/super-admin/clinics" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Clínicas
                </Link>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{clinic.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-500">ID: {clinic.slug}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${clinic.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {clinic.is_active ? 'Activa' : 'Inactiva'}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${clinic.subscription_status === 'active' ? 'bg-blue-100 text-blue-800' :
                                        clinic.subscription_status === 'trial' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    Plan {clinic.subscription_tier}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleStatusChange(!clinic.is_active)}
                            className={clinic.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                            {clinic.is_active ? 'Desactivar Clínica' : 'Activar Clínica'}
                        </Button>
                        <Button>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar Detalles
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Usuarios</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.users}</p>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Users className="h-5 w-5 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Pacientes</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.patients}</p>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">Citas</span>
                            </div>
                            <p className="text-2xl font-bold">{stats.appointments}</p>
                        </Card>
                    </div>

                    {/* Activity Placeholder */}
                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Actividad Reciente
                        </h3>
                        <div className="text-center py-8 text-gray-500">
                            No hay actividad reciente registrada
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                        <div className="space-y-4">
                            {clinic.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span>{clinic.email}</span>
                                </div>
                            )}
                            {clinic.phone && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span>{clinic.phone}</span>
                                </div>
                            )}
                            {(clinic.city || clinic.state) && (
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span>{clinic.city}, {clinic.state}, {clinic.country}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Encargado</h3>
                        {clinic.manager ? (
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                    {clinic.manager.full_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{clinic.manager.full_name}</p>
                                    <p className="text-sm text-gray-500">Clinic Manager</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No asignado</p>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Suscripción</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Estado</span>
                                <span className="font-medium capitalize">{clinic.subscription_status}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Plan</span>
                                <span className="font-medium capitalize">{clinic.subscription_tier}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Creada</span>
                                <span className="font-medium">{new Date(clinic.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
