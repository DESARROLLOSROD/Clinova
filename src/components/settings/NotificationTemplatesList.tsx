'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare } from 'lucide-react';

interface NotificationTemplatesListProps {
  initialNotificationTemplates: any[];
}

export function NotificationTemplatesList({
  initialNotificationTemplates,
}: NotificationTemplatesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plantillas de Notificaciones</CardTitle>
        <CardDescription>
          Plantillas de emails y SMS para comunicación con pacientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {initialNotificationTemplates.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay plantillas configuradas. Las plantillas predeterminadas se crearán
              automáticamente.
            </p>
          ) : (
            initialNotificationTemplates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {template.template_type === 'email' ? (
                      <Mail size={18} className="text-blue-600" />
                    ) : (
                      <MessageSquare size={18} className="text-green-600" />
                    )}
                    <h4 className="font-medium text-gray-900">{template.template_name}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={template.template_type === 'email' ? 'default' : 'secondary'}>
                      {template.template_type.toUpperCase()}
                    </Badge>
                    {!template.is_active && <Badge variant="outline">Inactivo</Badge>}
                  </div>
                </div>

                {template.subject && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">Asunto:</p>
                    <p className="text-sm text-gray-700">{template.subject}</p>
                  </div>
                )}

                <div className="mb-2">
                  <p className="text-xs text-gray-500">Evento:</p>
                  <p className="text-sm text-gray-700">{template.trigger_event}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Plantilla:</p>
                  <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {template.body_template}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Las variables disponibles en las plantillas incluyen:{' '}
                    <code className="bg-gray-100 px-1 rounded">
                      {'{{patient_name}}, {{clinic_name}}, {{appointment_date}}, {{appointment_time}}'}
                    </code>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          <p className="font-medium mb-1">Nota:</p>
          <p>
            La edición de plantillas de notificaciones estará disponible en una próxima
            actualización. Las plantillas listadas fueron creadas automáticamente durante la
            configuración inicial.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
