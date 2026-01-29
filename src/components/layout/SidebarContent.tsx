'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Calendar,
    Activity,
    CreditCard,
    Settings,
    Stethoscope,
    FileText,
    Dumbbell,
    BarChart3,
    UserCog,
    Shield
} from 'lucide-react'
import { cn } from '@/components/ui/button'
import { useUser, Permission } from '@/contexts/UserContext'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getDaysDifference, getSubscriptionStatusColor } from '@/lib/utils'

interface NavigationItem {
    name: string
    href: string
    icon: any
    permission?: Permission | Permission[]
}

const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
        name: 'Pacientes',
        href: '/dashboard/pacientes',
        icon: Users,
        permission: 'patients:view'
    },
    {
        name: 'Fisioterapeutas',
        href: '/dashboard/fisioterapeutas',
        icon: UserCog,
        permission: 'users:manage'
    },
    {
        name: 'Agenda',
        href: '/dashboard/agenda',
        icon: Calendar,
        permission: ['appointments:view_all', 'appointments:view_own']
    },
    {
        name: 'Sesiones',
        href: '/dashboard/sesiones',
        icon: Activity,
        permission: 'sessions:view'
    },
    {
        name: 'Plantillas',
        href: '/dashboard/plantillas',
        icon: FileText,
        permission: 'exercises:view'
    },
    {
        name: 'Ejercicios',
        href: '/dashboard/ejercicios',
        icon: Dumbbell,
        permission: 'exercises:view'
    },
    {
        name: 'Pagos',
        href: '/dashboard/pagos',
        icon: CreditCard,
        permission: ['payments:view_all', 'payments:view_own']
    },
    {
        name: 'Reportes',
        href: '/dashboard/reportes',
        icon: BarChart3,
        permission: ['reports:view_all', 'reports:view_own']
    },
    {
        name: 'Usuarios',
        href: '/dashboard/users',
        icon: Shield,
        permission: 'users:manage'
    },
    {
        name: 'Configuración',
        href: '/dashboard/configuracion',
        icon: Settings,
        permission: 'clinic:configure'
    },
    {
        name: 'Servicios',
        href: '/dashboard/servicios',
        icon: Activity,
        permission: 'clinic:configure'
    },
]

interface SidebarContentProps {
    onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
    const pathname = usePathname()
    const { can, loading, profile } = useUser()
    const [clinicSubscription, setClinicSubscription] = useState<{ next_payment_date: string | null, subscription_tier: string } | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (profile?.clinic_id) {
            const fetchClinicData = async () => {
                const { data } = await supabase
                    .from('clinics')
                    .select('next_payment_date, subscription_tier')
                    .eq('id', profile.clinic_id)
                    .single()

                if (data) {
                    setClinicSubscription(data)
                }
            }
            fetchClinicData()
        }
    }, [profile?.clinic_id])

    if (loading && !profile) {
        return (
            <div className="flex h-full flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
                <div className="px-6 py-8">
                    <div className="flex items-center gap-2 mb-8 animate-pulse">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex h-full flex-col bg-white border-r border-gray-200">
                <div className="px-6 py-8">
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-sm font-medium text-red-800">Error de Perfil</p>
                    </div>
                </div>
            </div>
        );
    }

    const visibleNavigation = navigation.filter(item => {
        if (!item.permission) return true;
        return Array.isArray(item.permission) ? item.permission.some(p => can(p)) : can(item.permission);
    });

    return (
        <div className="flex h-full flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-colors">
            {/* Logo y Encabezado */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                        <Activity className="text-white h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                            Clinova
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Panel de Control</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {visibleNavigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={onNavigate}
                                className={cn(
                                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                        : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 shrink-0 transition-colors",
                                        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                    )}
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 p-4">
                <div className="border-t border-gray-100 dark:border-gray-800 p-4">
                    {clinicSubscription ? (
                        <div className={`rounded-xl p-4 border ${(() => {
                            const days = getDaysDifference(clinicSubscription.next_payment_date)
                            if (days === null) return 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20'
                            if (days < 3) return 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20'
                            if (days < 15) return 'bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900/20'
                            return 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20'
                        })()
                            }`}>
                            <h4 className="text-sm font-semibold capitalize text-gray-900 dark:text-gray-100">Plan {clinicSubscription.subscription_tier}</h4>
                            <p className={`mt-1 text-xs font-medium ${getSubscriptionStatusColor(getDaysDifference(clinicSubscription.next_payment_date))}`}>
                                {(() => {
                                    const days = getDaysDifference(clinicSubscription.next_payment_date)
                                    if (days === null) return 'Suscripción activa'
                                    if (days < 0) return `Venció hace ${Math.abs(days)} días`
                                    if (days === 0) return 'Vence hoy'
                                    return `Tu licencia expira en ${days} días`
                                })()}
                            </p>
                            {(() => {
                                const days = getDaysDifference(clinicSubscription.next_payment_date)
                                if (days !== null && days < 15) {
                                    return (
                                        <button className="mt-3 text-xs font-bold text-red-600 hover:text-red-700 hover:underline">
                                            Renovar ahora
                                        </button>
                                    )
                                }
                                return null
                            })()}
                        </div>
                    ) : (
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
