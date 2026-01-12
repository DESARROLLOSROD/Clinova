'use client'

import { Card } from '@/components/ui/card'

export default function BillingPage() {
    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Facturación</h1>
                <p className="text-gray-600 mt-2">Gestión de facturación y pagos de la plataforma</p>
            </div>

            <Card className="p-6">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                        Módulo de Facturación
                    </h2>
                    <p className="text-gray-500">
                        Esta sección estará disponible próximamente.
                    </p>
                </div>
            </Card>
        </div>
    )
}
