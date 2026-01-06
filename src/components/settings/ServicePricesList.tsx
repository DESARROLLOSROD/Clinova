'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ServicePricesListProps {
  initialServicePrices: any[];
}

export function ServicePricesList({ initialServicePrices }: ServicePricesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Servicios y Precios</CardTitle>
        <CardDescription>
          Catálogo de servicios disponibles en tu clínica
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {initialServicePrices.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay servicios configurados. Los servicios predeterminados se crearán automáticamente.
            </p>
          ) : (
            initialServicePrices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{service.service_name}</h4>
                    {service.service_code && (
                      <Badge variant="outline" className="text-xs">
                        {service.service_code}
                      </Badge>
                    )}
                    {!service.is_active && (
                      <Badge variant="secondary" className="text-xs">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    {service.category && (
                      <span className="text-xs text-gray-500">
                        Categoría: {service.category}
                      </span>
                    )}
                    {service.duration_minutes && (
                      <span className="text-xs text-gray-500">
                        Duración: {service.duration_minutes} min
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-lg font-bold text-gray-900">
                    ${service.price.toFixed(2)}
                  </p>
                  {service.discounted_price && (
                    <p className="text-sm text-gray-500 line-through">
                      ${service.discounted_price.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          <p className="font-medium mb-1">Nota:</p>
          <p>
            La gestión avanzada de servicios (agregar, editar, eliminar) estará disponible en una
            próxima actualización. Los servicios listados fueron creados automáticamente durante
            la configuración inicial.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
