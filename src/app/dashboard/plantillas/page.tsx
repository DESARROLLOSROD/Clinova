import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, FileText, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface TreatmentTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_minutes: number | null;
  frequency: string | null;
  objectives: string[] | null;
  is_active: boolean;
  created_at: string;
  template_techniques: { id: string }[];
}

export default async function TreatmentTemplatesPage() {
  const supabase = await createClient();

  const { data: templates, error } = await supabase
    .from('treatment_templates')
    .select(`
      *,
      template_techniques (id)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
  }

  // Agrupar por categoría
  const categorizedTemplates = (templates || []).reduce((acc, template) => {
    const category = template.category || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, TreatmentTemplate[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantillas de Tratamiento</h1>
          <p className="text-gray-600 text-sm mt-1">
            Crea y gestiona plantillas reutilizables para tratamientos comunes
          </p>
        </div>
        <Link href="/dashboard/plantillas/nueva">
          <Button className="gap-2">
            <Plus size={18} />
            Nueva Plantilla
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total Plantillas</p>
          <p className="text-2xl font-bold text-blue-600">{templates?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-600">Plantillas Activas</p>
          <p className="text-2xl font-bold text-green-600">
            {templates?.filter((t) => t.is_active).length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-600">Categorías</p>
          <p className="text-2xl font-bold text-purple-600">
            {Object.keys(categorizedTemplates).length}
          </p>
        </div>
      </div>

      {Object.keys(categorizedTemplates).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No hay plantillas</h3>
          <p className="mt-2 text-sm text-gray-500">
            Comienza creando tu primera plantilla de tratamiento
          </p>
          <Link href="/dashboard/plantillas/nueva">
            <Button className="mt-4 gap-2">
              <Plus size={18} />
              Crear Primera Plantilla
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(categorizedTemplates).map(([category, categoryTemplates]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(categoryTemplates as any[]).map((template) => (
                  <Link
                    key={template.id}
                    href={`/dashboard/plantillas/${template.id}`}
                    className="block"
                  >
                    <div className="bg-white rounded-lg shadow border border-gray-100 p-5 hover:shadow-md transition-shadow h-full">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 flex-1">{template.name}</h3>
                        {!template.is_active && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Inactiva
                          </span>
                        )}
                      </div>

                      {template.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {template.description}
                        </p>
                      )}

                      <div className="space-y-2">
                        {template.duration_minutes && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={16} className="text-gray-400" />
                            <span>{template.duration_minutes} minutos</span>
                          </div>
                        )}

                        {template.frequency && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Activity size={16} className="text-gray-400" />
                            <span>{template.frequency}</span>
                          </div>
                        )}

                        {template.template_techniques &&
                          template.template_techniques.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FileText size={16} className="text-gray-400" />
                              <span>{template.template_techniques.length} técnicas</span>
                            </div>
                          )}
                      </div>

                      {template.objectives && template.objectives.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-1">Objetivos:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.objectives.slice(0, 3).map((objective: any, idx: number) => (
                              <span
                                key={idx}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                              >
                                {objective}
                              </span>
                            ))}
                            {template.objectives.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{template.objectives.length - 3} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
