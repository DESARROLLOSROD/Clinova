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
import { useRole } from '@/contexts/RoleContext'
import { Permission } from '@/types/roles'

interface NavigationItem {
    name: string
    href: string
    icon: any
    permission?: Permission | Permission[]
    adminOnly?: boolean
    staffOnly?: boolean
    therapistOnly?: boolean
}

const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
        name: 'Pacientes',
        href: '/dashboard/pacientes',
        icon: Users,
        permission: [Permission.PATIENT_VIEW_ALL, Permission.PATIENT_VIEW_ASSIGNED, Permission.PATIENT_VIEW_OWN]
    },
    {
        name: 'Fisioterapeutas',
        href: '/dashboard/fisioterapeutas',
        icon: UserCog,
        permission: Permission.THERAPIST_VIEW_ALL
    },
    {
        name: 'Agenda',
        href: '/dashboard/agenda',
        icon: Calendar,
        permission: [Permission.APPOINTMENT_VIEW_ALL, Permission.APPOINTMENT_VIEW_ASSIGNED]
    },
    {
        name: 'Sesiones',
        href: '/dashboard/sesiones',
        icon: Activity,
        permission: [Permission.SESSION_VIEW_ALL, Permission.SESSION_VIEW_ASSIGNED]
    },
    {
        name: 'Plantillas',
        href: '/dashboard/plantillas',
        icon: FileText,
        permission: [Permission.TEMPLATE_VIEW, Permission.TEMPLATE_CREATE]
    },
    {
        name: 'Ejercicios',
        href: '/dashboard/ejercicios',
        icon: Dumbbell,
        permission: Permission.EXERCISE_VIEW
    },
    {
        name: 'Pagos',
        href: '/dashboard/pagos',
        icon: CreditCard,
        permission: [Permission.PAYMENT_VIEW_ALL, Permission.PAYMENT_VIEW_ASSIGNED]
    },
    {
        name: 'Reportes',
        href: '/dashboard/reportes',
        icon: BarChart3,
        permission: [Permission.REPORT_VIEW_ALL, Permission.REPORT_VIEW_ASSIGNED]
    },
    {
        name: 'Usuarios',
        href: '/dashboard/users',
        icon: Shield,
        adminOnly: true
    },
    {
        name: 'Configuración',
        href: '/dashboard/configuracion',
        icon: Settings,
        permission: Permission.SETTINGS_VIEW
    },
]

export function Sidebar() {
    const pathname = usePathname()
    const { isAdmin, isStaff, isTherapist, hasPermission, hasAnyPermission, isLoading } = useRole()

    const canViewItem = (item: NavigationItem): boolean => {
        // Always show dashboard
        if (item.href === '/dashboard') return true

        // Check admin only
        if (item.adminOnly && !isAdmin) return false

        // Check staff only
        if (item.staffOnly && !isStaff) return false

        // Check therapist only
        if (item.therapistOnly && !isTherapist) return false

        // Check permissions
        if (item.permission) {
            if (Array.isArray(item.permission)) {
                return hasAnyPermission(item.permission)
            } else {
                return hasPermission(item.permission)
            }
        }

        // Default: show if no restrictions
        return true
    }

    const visibleNavigation = navigation.filter(canViewItem)

    return (
        <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
            <div className="flex h-16 items-center px-6 border-b border-gray-100">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-xl text-gray-900">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-white" />
                    </div>
                    <span>Clinova</span>
                </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                {isLoading ? (
                    <div className="px-3 py-2 text-sm text-gray-500">Cargando...</div>
                ) : (
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
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "h-5 w-5 shrink-0 transition-colors",
                                            isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                        )}
                                    />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>
                )}
            </div>
            <div className="border-t border-gray-100 p-4">
                <div className="rounded-xl bg-blue-50 p-4">
                    <h4 className="text-sm font-semibold text-blue-900">Plan Profesional</h4>
                    <p className="mt-1 text-xs text-blue-700">Tu licencia expira en 30 días</p>
                    <button className="mt-3 text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline">
                        Renovar ahora
                    </button>
                </div>
            </div>
        </div>
    )
}
