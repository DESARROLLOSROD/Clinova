'use client'

import { User, LogOut } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useUser } from '@/contexts/UserContext'
import { UserRole } from '@/types/roles'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function Header({ userEmail }: { userEmail?: string }) {
    const { profile, user } = useUser()
    const userRole = profile?.role as UserRole | undefined
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const displayName = user?.user_metadata?.first_name && user?.user_metadata?.last_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : userEmail || 'Usuario'

    // Get role display name locally (client-side)
    const getRoleLabel = (role: UserRole | null): string => {
        if (!role) return 'Usuario'
        const labels: Record<UserRole, string> = {
            [UserRole.ADMIN]: 'Administrador',
            [UserRole.THERAPIST]: 'Fisioterapeuta',
            [UserRole.RECEPTIONIST]: 'Recepcionista',
            [UserRole.PATIENT]: 'Paciente',
        }
        return labels[role] || 'Usuario'
    }

    const roleLabel = getRoleLabel(userRole || null)

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push('/login')
            router.refresh()
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Panel Principal</h2>

            <div className="flex items-center gap-4">
                <NotificationBell therapistEmail={userEmail} />
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-700">{displayName}</span>
                        <span className="text-xs text-gray-500">{roleLabel}</span>
                    </div>
                    <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <User size={18} />
                    </div>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="ml-2 flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cerrar sesión"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">{isLoggingOut ? 'Cerrando...' : 'Salir'}</span>
                    </button>
                </div>
            </div>
        </header>
    )
}
