import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Activity, AlertTriangle, Target, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: template, error } = await supabase
    .from('treatment_templates')
    .select(`
      *,
      template_techniques (*)
    `)
    .eq('id', id)
    .single();

  if (error || !template) {
    notFound();
  }

  // Ordenar técnicas por order_index
  const techniques = (template.template_techniques || []).sort(
    (a: any, b: any) => a.order_index - b.order_index
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/plantillas">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Volver a Plantillas
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
            {template.category && (
              <p className="text-gray-600 mt-1">Categoría: {template.category}</p>
            )}
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                template.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {template.is_active ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>
      </div>

      {template.description && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-2">Descripción</h2>
          <p className="text-gray-700">{template.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {template.duration_minutes && (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Duración Estimada</p>
                <p className="text-xl font-semibold text-gray-900">
                  {template.duration_minutes} minutos
                </p>
              </div>
            </div>
          </div>
        )}

        {template.frequency && (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Frecuencia Recomendada</p>
                <p className="text-xl font-semibold text-gray-900">{template.frequency}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {template.objectives && template.objectives.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-green-600" size={20} />
            <h2 className="text-lg font-semibold">Objetivos del Tratamiento</h2>
          </div>
          <ul className="space-y-2">
            {template.objectives.map((objective: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {template.contraindications && template.contraindications.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-600" size={20} />
            <h2 className="text-lg font-semibold">Contraindicaciones</h2>
          </div>
          <ul className="space-y-2">
            {template.contraindications.map((contraindication: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600 mt-1">•</span>
                <span className="text-gray-700">{contraindication}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {techniques.length > 0 && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold">Técnicas y Procedimientos</h2>
          </div>
          <div className="space-y-4">
            {techniques.map((technique: any, index: number) => (
              <div key={technique.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{technique.name}</h3>
                      {technique.description && (
                        <p className="text-sm text-gray-600 mt-1">{technique.description}</p>
                      )}
                    </div>
                  </div>
                  {technique.duration_minutes && (
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {technique.duration_minutes} min
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {template.notes && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-2">Notas Adicionales</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{template.notes}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">¿Quieres usar esta plantilla?</h3>
        <p className="text-blue-800 text-sm mb-4">
          Puedes asignar esta plantilla a un paciente desde la página de detalles del paciente o al
          crear una nueva cita.
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard/pacientes">
            <Button variant="outline" size="sm">
              Ver Pacientes
            </Button>
          </Link>
          <Link href="/dashboard/agenda/nueva">
            <Button size="sm">Nueva Cita con Plantilla</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
