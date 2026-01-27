'use client';

import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';

export function AdminBar() {
    const { isImpersonating, stopImpersonating, profile } = useUser();

    if (!isImpersonating) return null;

    return (
        <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-amber-900 text-sm">
            <div className="flex items-center gap-2">
                <Eye size={16} />
                <span className="font-medium">Modo Vista:</span>
                <span>Estás viendo los datos de la clínica con ID: <strong>{profile?.clinic_id}</strong></span>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={stopImpersonating}
                className="h-7 text-amber-900 hover:bg-amber-200 hover:text-amber-900"
            >
                <X size={14} className="mr-1" />
                Salir del modo vista
            </Button>
        </div>
    );
}
