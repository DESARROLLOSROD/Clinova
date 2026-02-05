'use client';

import { LogOut } from 'lucide-react';
import { signOutAction } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await signOutAction();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors text-sm font-medium px-4 py-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
        >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
        </button>
    );
}
