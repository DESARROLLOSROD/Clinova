
import { User } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export function Header({ userEmail }: { userEmail?: string }) {
    return (
        <header className="h-16 border-b border-gray-200 bg-white px-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Panel Principal</h2>

            <div className="flex items-center gap-4">
                <NotificationBell therapistEmail={userEmail} />
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-700">{userEmail || 'Usuario'}</span>
                        <span className="text-xs text-gray-500">Administrador</span>
                    </div>
                    <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>
    )
}
