'use client'

import { User, LogOut } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { useUser } from '@/contexts/UserContext'
import { UserRole } from '@/types/roles'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ModeToggle } from '@/components/shared/ModeToggle'

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
            [UserRole.SUPER_ADMIN]: 'Super Administrador',
            [UserRole.CLINIC_MANAGER]: 'Encargado de Clínica',
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

            // Set a timeout for the signout process just in case
            const logoutPromise = supabase.auth.signOut()
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Logout timed out')), 3000)
            )

            try {
                await Promise.race([logoutPromise, timeoutPromise])
            } catch (err) {
                console.warn('Logout timed out or failed, proceeding with local cleanup:', err)
            }

            // Always redirect and refresh to be sure
            window.location.href = '/login'
        } catch (error) {
            console.error('Error al cerrar sesión:', error)
            // Fallback redirect
            window.location.href = '/login'
        }
    }

    return (
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-8 flex items-center justify-between transition-colors">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Panel Principal</h2>

            <div className="flex items-center gap-4">
                <ModeToggle />
                <NotificationBell therapistEmail={userEmail} />
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{displayName}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{roleLabel}</span>
                    </div>
                    <div className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <User size={18} />
                    </div>
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="ml-2 flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
