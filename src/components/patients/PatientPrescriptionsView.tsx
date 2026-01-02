'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Dumbbell, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface PatientPrescriptionsViewProps {
  patientId: string;
}

interface Prescription {
  id: string;
  start_date: string;
  end_date: string | null;
  status: string;
  sets: number | null;
  repetitions: number | null;
  duration_minutes: number | null;
  frequency_per_week: number | null;
  instructions: string | null;
  exercise_library: {
    id: string;
    name: string;
    category: string;
    body_part: string;
    difficulty: string;
  };
}

export function PatientPrescriptionsView({ patientId }: PatientPrescriptionsViewProps) {
  const supabase = createClient();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('active');

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patient_exercise_prescriptions')
      .select(
        `
        *,
        exercise_library (
          id,
          name,
          category,
          body_part,
          difficulty
        )
      `
      )
      .eq('patient_id', patientId)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching prescriptions:', error);
    } else {
      setPrescriptions(data || []);
    }
    setLoading(false);
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
  };

  const statusLabels: Record<string, string> = {
    active: 'Activo',
    paused: 'Pausado',
    completed: 'Completado',
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-50 text-green-700 border-green-200',
    intermediate: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    advanced: 'bg-red-50 text-red-700 border-red-200',
  };

  const difficultyLabels: Record<string, string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-500 text-center">Cargando prescripciones...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Dumbbell className="text-blue-600" size={20} />
          Ejercicios Prescritos
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-full ${
              filter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos ({prescriptions.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 text-xs rounded-full ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Activos ({prescriptions.filter((p) => p.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 text-xs rounded-full ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completados ({prescriptions.filter((p) => p.status === 'completed').length})
          </button>
        </div>
      </div>

      {filteredPrescriptions.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No hay ejercicios prescritos
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {filter === 'active'
              ? 'No hay ejercicios activos en este momento'
              : 'Usa el botón "Prescribir Ejercicios" para agregar ejercicios'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPrescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <Link href={`/dashboard/ejercicios/${prescription.exercise_library.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {prescription.exercise_library.name}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {prescription.exercise_library.category && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {prescription.exercise_library.category}
                      </span>
                    )}
                    {prescription.exercise_library.body_part && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {prescription.exercise_library.body_part}
                      </span>
                    )}
                    {prescription.exercise_library.difficulty && (
                      <span
                        className={`text-xs px-2 py-1 rounded border ${
                          difficultyColors[prescription.exercise_library.difficulty]
                        }`}
                      >
                        {difficultyLabels[prescription.exercise_library.difficulty]}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    statusColors[prescription.status]
                  }`}
                >
                  {statusLabels[prescription.status]}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                {prescription.sets && (
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Series</p>
                    <p className="font-semibold text-gray-900">{prescription.sets}</p>
                  </div>
                )}
                {prescription.repetitions && (
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Repeticiones</p>
                    <p className="font-semibold text-gray-900">{prescription.repetitions}</p>
                  </div>
                )}
                {prescription.duration_minutes && (
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Duración</p>
                    <p className="font-semibold text-gray-900">{prescription.duration_minutes} min</p>
                  </div>
                )}
                {prescription.frequency_per_week && (
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-gray-500 text-xs">Frecuencia</p>
                    <p className="font-semibold text-gray-900">
                      {prescription.frequency_per_week}x/semana
                    </p>
                  </div>
                )}
              </div>

              {prescription.instructions && (
                <div className="bg-blue-50 border border-blue-100 rounded p-3 mb-3">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Instrucciones: </span>
                    {prescription.instructions}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>
                    Inicio: {new Date(prescription.start_date).toLocaleDateString('es-ES')}
                  </span>
                </div>
                {prescription.end_date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>Fin: {new Date(prescription.end_date).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
