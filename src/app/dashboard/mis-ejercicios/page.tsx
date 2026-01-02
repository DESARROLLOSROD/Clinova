'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Dumbbell, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    description: string;
    instructions: string;
    video_url: string | null;
    image_url: string | null;
  };
}

interface AdherenceLog {
  id: string;
  log_date: string;
  completed: boolean;
  sets_completed: number | null;
  repetitions_completed: number | null;
  duration_minutes: number | null;
  notes: string | null;
}

export default function MyExercisesPage() {
  const supabase = createClient();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [adherenceLogs, setAdherenceLogs] = useState<Record<string, AdherenceLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPatientId();
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchPrescriptions();
    }
  }, [patientId]);

  const fetchUserPatientId = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    // In a real app, you would have a mapping between auth users and patients
    // For now, we'll just fetch the first patient
    const { data: patients } = await supabase
      .from('patients')
      .select('id')
      .eq('email', user.user.email)
      .limit(1);

    if (patients && patients.length > 0) {
      setPatientId(patients[0].id);
    }
  };

  const fetchPrescriptions = async () => {
    if (!patientId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('patient_exercise_prescriptions')
      .select(
        `
        *,
        exercise_library (
          id,
          name,
          description,
          instructions,
          video_url,
          image_url
        )
      `
      )
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching prescriptions:', error);
    } else {
      setPrescriptions(data || []);
      // Fetch adherence logs for each prescription
      if (data) {
        data.forEach((prescription) => {
          fetchAdherenceForPrescription(prescription.id);
        });
      }
    }
    setLoading(false);
  };

  const fetchAdherenceForPrescription = async (prescriptionId: string) => {
    const { data } = await supabase
      .from('exercise_adherence_log')
      .select('*')
      .eq('prescription_id', prescriptionId)
      .order('log_date', { ascending: false })
      .limit(7);

    if (data) {
      setAdherenceLogs((prev) => ({ ...prev, [prescriptionId]: data }));
    }
  };

  const logExercise = async (
    prescriptionId: string,
    completed: boolean,
    sets?: number,
    reps?: number,
    duration?: number,
    notes?: string
  ) => {
    const today = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from('exercise_adherence_log').insert({
      prescription_id: prescriptionId,
      log_date: today,
      completed,
      sets_completed: sets || null,
      repetitions_completed: reps || null,
      duration_minutes: duration || null,
      notes: notes || null,
    });

    if (error) {
      console.error('Error logging exercise:', error);
      alert('Error al registrar el ejercicio');
    } else {
      alert('¡Ejercicio registrado exitosamente!');
      fetchAdherenceForPrescription(prescriptionId);
    }
  };

  const getAdherenceRate = (prescriptionId: string) => {
    const logs = adherenceLogs[prescriptionId] || [];
    if (logs.length === 0) return 0;
    const completed = logs.filter((log) => log.completed).length;
    return Math.round((completed / logs.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Cargando ejercicios...</p>
      </div>
    );
  }

  if (!patientId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No se encontró perfil de paciente
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Contacta a tu fisioterapeuta para configurar tu cuenta
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Ejercicios</h1>
        <p className="text-gray-600 text-sm mt-1">
          Ejercicios prescritos y registro de adherencia
        </p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No tienes ejercicios prescritos
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Habla con tu fisioterapeuta para que te prescriba ejercicios
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {prescriptions.map((prescription) => {
            const adherenceRate = getAdherenceRate(prescription.id);
            const recentLogs = adherenceLogs[prescription.id] || [];
            const completedToday = recentLogs.some(
              (log) =>
                log.log_date === new Date().toISOString().slice(0, 10) && log.completed
            );

            return (
              <div
                key={prescription.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {prescription.exercise_library.name}
                    </h2>
                    {prescription.exercise_library.description && (
                      <p className="text-gray-600 text-sm mt-1">
                        {prescription.exercise_library.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp size={16} className="text-green-600" />
                    <span className="font-semibold text-green-600">{adherenceRate}%</span>
                    <span className="text-gray-500">adherencia</span>
                  </div>
                </div>

                {prescription.exercise_library.image_url && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={prescription.exercise_library.image_url}
                      alt={prescription.exercise_library.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {prescription.sets && (
                    <div className="bg-blue-50 rounded p-3">
                      <p className="text-blue-600 text-xs font-medium">Series</p>
                      <p className="text-blue-900 font-bold text-lg">{prescription.sets}</p>
                    </div>
                  )}
                  {prescription.repetitions && (
                    <div className="bg-purple-50 rounded p-3">
                      <p className="text-purple-600 text-xs font-medium">Repeticiones</p>
                      <p className="text-purple-900 font-bold text-lg">
                        {prescription.repetitions}
                      </p>
                    </div>
                  )}
                  {prescription.duration_minutes && (
                    <div className="bg-green-50 rounded p-3">
                      <p className="text-green-600 text-xs font-medium">Duración</p>
                      <p className="text-green-900 font-bold text-lg">
                        {prescription.duration_minutes}min
                      </p>
                    </div>
                  )}
                  {prescription.frequency_per_week && (
                    <div className="bg-orange-50 rounded p-3">
                      <p className="text-orange-600 text-xs font-medium">Frecuencia</p>
                      <p className="text-orange-900 font-bold text-lg">
                        {prescription.frequency_per_week}x/sem
                      </p>
                    </div>
                  )}
                </div>

                {prescription.exercise_library.instructions && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Instrucciones:</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-line">
                      {prescription.exercise_library.instructions}
                    </p>
                  </div>
                )}

                {prescription.instructions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Instrucciones personalizadas:
                    </h3>
                    <p className="text-blue-800 text-sm">{prescription.instructions}</p>
                  </div>
                )}

                {prescription.exercise_library.video_url && (
                  <div className="mb-4">
                    <a
                      href={prescription.exercise_library.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver video demostrativo →
                    </a>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Registro de Hoy</h3>
                    {completedToday && (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle size={16} />
                        Completado hoy
                      </span>
                    )}
                  </div>

                  {!completedToday && (
                    <Button
                      onClick={() =>
                        logExercise(
                          prescription.id,
                          true,
                          prescription.sets || undefined,
                          prescription.repetitions || undefined,
                          prescription.duration_minutes || undefined
                        )
                      }
                      className="w-full gap-2"
                    >
                      <CheckCircle size={18} />
                      Marcar como Completado
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
