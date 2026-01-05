import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, Dumbbell, Search } from 'lucide-react';
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

export default async function ExerciseLibraryPage() {
  const supabase = await createClient();

  const { data: exercises, error } = await supabase
    .from('exercise_library')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching exercises:', error);
  }

  // Agrupar por categoría
  const categorizedExercises = (exercises || []).reduce((acc, exercise) => {
    const category = exercise.category || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(exercise);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Ejercicios</h1>
          <p className="text-gray-600 text-sm mt-1">
            Gestiona ejercicios y préscribelos a tus pacientes
          </p>
        </div>
        <Link href="/dashboard/ejercicios/nuevo">
          <Button className="gap-2">
            <Plus size={18} />
            Nuevo Ejercicio
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total Ejercicios</p>
          <p className="text-2xl font-bold text-blue-600">{exercises?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-600">Categorías</p>
          <p className="text-2xl font-bold text-purple-600">
            {Object.keys(categorizedExercises).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-600">Prescripciones Activas</p>
          <p className="text-2xl font-bold text-green-600">0</p>
        </div>
      </div>

      {Object.keys(categorizedExercises).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No hay ejercicios</h3>
          <p className="mt-2 text-sm text-gray-500">
            Comienza creando ejercicios para tu biblioteca
          </p>
          <Link href="/dashboard/ejercicios/nuevo">
            <Button className="mt-4 gap-2">
              <Plus size={18} />
              Crear Primer Ejercicio
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(categorizedExercises).map(([category, categoryExercises]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(categoryExercises as any[]).map((exercise) => (
                  <Link
                    key={exercise.id}
                    href={`/dashboard/ejercicios/${exercise.id}`}
                    className="block"
                  >
                    <div className="bg-white rounded-lg shadow border border-gray-100 p-5 hover:shadow-md transition-shadow h-full">
                      {exercise.image_url && (
                        <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 h-40">
                          <img
                            src={exercise.image_url}
                            alt={exercise.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 flex-1">{exercise.name}</h3>
                        {exercise.difficulty && (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              difficultyColors[exercise.difficulty]
                            }`}
                          >
                            {difficultyLabels[exercise.difficulty]}
                          </span>
                        )}
                      </div>

                      {exercise.body_part && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Zona:</span> {exercise.body_part}
                        </p>
                      )}

                      {exercise.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {exercise.description}
                        </p>
                      )}

                      {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exercise.equipment_needed.slice(0, 3).map((equipment: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {equipment}
                            </span>
                          ))}
                          {exercise.equipment_needed.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{exercise.equipment_needed.length - 3} más
                            </span>
                          )}
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
