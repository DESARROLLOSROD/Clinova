'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Building2, Users, Calendar, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { differenceInDays, parseISO } from 'date-fns'

interface Clinic {
    id: string
    name: string
    slug: string
    email: string | null
    phone: string | null
    city: string | null
    subscription_status: string
    subscription_tier: string
    created_at: string
    is_active: boolean
    next_payment_date: string | null
    _count?: {
        users: number
        patients: number
    }
}

export default function ClinicsPage() {
    const [clinics, setClinics] = useState<Clinic[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const supabase = createClient()

    useEffect(() => {
        fetchClinics()
    }, [])

    async function fetchClinics() {
        try {
            const { data, error } = await supabase
                .from('clinics')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            // Fetch counts for each clinic
            const clinicsWithCounts = await Promise.all(
                (data || []).map(async (clinic) => {
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

            setClinics(clinicsWithCounts)
        } catch (error) {
            console.error('Error fetching clinics:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredClinics = clinics.filter((clinic) =>
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.city?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando clínicas...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Clínicas</h1>
                    <p className="text-gray-600 mt-2">Administra todas las clínicas de la plataforma</p>
                </div>
                <Link href="/super-admin/clinics/new">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Nueva Clínica
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar clínicas por nombre, email o ciudad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Clinics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClinics.map((clinic) => (
                    <Card key={clinic.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Building2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{clinic.name}</h3>
                                    <p className="text-sm text-gray-500">{clinic.slug}</p>
                                </div>
                            </div>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${clinic.subscription_status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : clinic.subscription_status === 'trial'
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {clinic.subscription_status}
                                {clinic.subscription_status}
                            </span>
                        </div>

                        {/* Renewal Countdown Badge */}
                        {clinic.next_payment_date && (
                            <div className={`mb-4 p-2 rounded-lg flex items-center gap-2 text-sm font-medium ${(() => {
                                const days = differenceInDays(parseISO(clinic.next_payment_date), new Date())
                                if (days < 3) return 'bg-red-100 text-red-700'
                                if (days < 15) return 'bg-orange-100 text-orange-700'
                                return 'bg-green-100 text-green-700'
                            })()
                                }`}>
                                <Calendar className="h-4 w-4" />
                                {(() => {
                                    const days = differenceInDays(parseISO(clinic.next_payment_date), new Date())
                                    if (days < 0) return `Venció hace ${Math.abs(days)} días`
                                    if (days === 0) return 'Vence hoy'
                                    return `Renovación en ${days} días`
                                })()}
                            </div>
                        )}

                        <div className="space-y-2 mb-4">
                            {clinic.email && (
                                <p className="text-sm text-gray-600">📧 {clinic.email}</p>
                            )}
                            {clinic.phone && (
                                <p className="text-sm text-gray-600">📞 {clinic.phone}</p>
                            )}
                            {clinic.city && (
                                <p className="text-sm text-gray-600">📍 {clinic.city}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mb-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>{clinic._count?.users || 0} usuarios</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span>{clinic._count?.patients || 0} pacientes</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                                <p className="text-xs text-gray-500">Plan</p>
                                <p className="text-sm font-medium capitalize">{clinic.subscription_tier}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Creada</p>
                                <p className="text-sm font-medium">
                                    {new Date(clinic.created_at).toLocaleDateString('es-MX')}
                                </p>
                            </div>
                        </div>

                        <Link href={`/super-admin/clinics/${clinic.id}`}>
                            <Button variant="outline" className="w-full mt-4">
                                Ver Detalles
                            </Button>
                        </Link>
                    </Card>
                ))}
            </div>

            {filteredClinics.length === 0 && (
                <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No se encontraron clínicas</p>
                </div>
            )}
        </div>
    )
}
