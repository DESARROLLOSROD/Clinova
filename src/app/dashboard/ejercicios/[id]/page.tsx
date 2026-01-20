import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Package, Clock, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

const difficultyLabels: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

export default async function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: exercise, error } = await supabase
    .from('exercise_library')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !exercise) {
    notFound();
  }

  // Get prescription count
  const { count: prescriptionCount } = await supabase
    .from('patient_exercise_prescriptions')
    .select('*', { count: 'exact', head: true })
    .eq('exercise_id', id);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/ejercicios">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Volver a Ejercicios
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{exercise.name}</h1>
            <div className="flex gap-3 mt-2">
              {exercise.category && (
                <span className="text-sm text-gray-600">
                  Categoría: <span className="font-medium">{exercise.category}</span>
                </span>
              )}
              {exercise.body_part && (
                <span className="text-sm text-gray-600">
                  Zona: <span className="font-medium">{exercise.body_part}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {exercise.difficulty && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  difficultyColors[exercise.difficulty]
                }`}
              >
                {difficultyLabels[exercise.difficulty]}
              </span>
            )}
            {!exercise.is_active && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                Inactivo
              </span>
            )}
          </div>
        </div>
      </div>

      {exercise.image_url && (
        <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
          <img
            src={exercise.image_url}
            alt={exercise.name}
            className="w-full max-h-96 object-contain bg-gray-50"
          />
        </div>
      )}

      {exercise.description && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-2">Descripción</h2>
          <p className="text-gray-700">{exercise.description}</p>
        </div>
      )}

      {exercise.instructions && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Instrucciones</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{exercise.instructions}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="text-blue-600" size={20} />
              Equipamiento Necesario
            </h2>
            <ul className="space-y-2">
              {exercise.equipment_needed.map((equipment: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  {equipment}
                </li>
              ))}
            </ul>
          </div>
        )}

        {exercise.contraindications && exercise.contraindications.length > 0 && (
          <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-600" size={20} />
              Contraindicaciones
            </h2>
            <ul className="space-y-2">
              {exercise.contraindications.map((contraindication: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  {contraindication}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {exercise.video_url && (
        <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Video Demostrativo</h2>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <a
              href={exercise.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              <Clock size={20} />
              Ver Video
            </a>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart className="text-purple-600" size={20} />
          Estadísticas de Uso
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Prescripciones Activas</p>
            <p className="text-2xl font-bold text-purple-600">{prescriptionCount || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">¿Quieres prescribir este ejercicio?</h3>
        <p className="text-blue-800 text-sm mb-4">
          Asigna este ejercicio a un paciente desde la página de detalles del paciente o durante
          una sesión.
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard/pacientes">
            <Button variant="outline" size="sm">
              Ver Pacientes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
