'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Algo salió mal cargando el dashboard
            </h2>
            <p className="text-gray-500 max-w-md text-center">
                Ha ocurrido un error al obtener los datos. Por favor, intenta recargar la página.
            </p>
            <Button
                onClick={() => reset()}
                variant="outline"
                className="gap-2"
            >
                <RefreshCw size={16} />
                Intentar de nuevo
            </Button>
        </div>
    )
}
