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
import React from 'react'

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
]

export function Sidebar() {
    const pathname = usePathname()
    const { can, loading, profile } = useUser()

    if (loading) {
        return (
            <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
                <div className="px-6 py-8">
                    <div className="flex items-center gap-2 mb-8 animate-pulse">
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-6 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
                <div className="flex h-16 items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 font-semibold text-xl text-gray-900">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-white" />
                        </div>
                        <span>Clinova</span>
                    </div>
                </div>
                <div className="px-6 py-8">
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-sm font-medium text-red-800">Error de Perfil</p>
                        <p className="mt-1 text-xs text-red-600">No se pudo cargar tu perfil. Contacta soporte.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 text-xs font-bold text-red-700 hover:underline"
                        >
                            Reintentar
                        </button>
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
        <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex h-16 items-center px-6 border-b border-gray-100 dark:border-gray-800">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-xl text-gray-900 dark:text-gray-100">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-white" />
                    </div>
                    <span>Clinova</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {visibleNavigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
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
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 p-4">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Plan Profesional</h4>
                    <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">Tu licencia expira en 30 días</p>
                    <button className="mt-3 text-xs font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">
                        Renovar ahora
                    </button>
                </div>
            </div>
        </div>
    )
}
