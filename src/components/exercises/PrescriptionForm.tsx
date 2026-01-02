'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { X, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrescriptionFormProps {
  patientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  body_part: string;
  difficulty: string;
  description: string;
}

interface PrescriptionItem {
  exercise_id: string;
  sets: string;
  repetitions: string;
  duration_minutes: string;
  frequency_per_week: string;
  instructions: string;
}

export function PrescriptionForm({ patientId, onSuccess, onCancel }: PrescriptionFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [formData, setFormData] = useState({
    start_date: new Date().toISOString().slice(0, 10),
    end_date: '',
    status: 'active' as 'active' | 'paused' | 'completed',
    notes: '',
  });

  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      exercise_id: '',
      sets: '',
      repetitions: '',
      duration_minutes: '',
      frequency_per_week: '',
      instructions: '',
    },
  ]);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const { data } = await supabase
      .from('exercise_library')
      .select('id, name, category, body_part, difficulty, description')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setExercises(data);
    }
  };

  const addPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      {
        exercise_id: '',
        sets: '',
        repetitions: '',
        duration_minutes: '',
        frequency_per_week: '',
        instructions: '',
      },
    ]);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof PrescriptionItem, value: string) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index] = { ...newPrescriptions[index], [field]: value };
    setPrescriptions(newPrescriptions);
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      searchTerm === '' ||
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.body_part?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(exercises.map((e) => e.category).filter(Boolean)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();

      // Validate that at least one exercise is selected
      const validPrescriptions = prescriptions.filter((p) => p.exercise_id);
      if (validPrescriptions.length === 0) {
        alert('Debes seleccionar al menos un ejercicio');
        setLoading(false);
        return;
      }

      // Insert all prescriptions
      const prescriptionData = validPrescriptions.map((prescription) => ({
        patient_id: patientId,
        exercise_id: prescription.exercise_id,
        prescribed_by: user.user?.id,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        sets: prescription.sets ? parseInt(prescription.sets) : null,
        repetitions: prescription.repetitions ? parseInt(prescription.repetitions) : null,
        duration_minutes: prescription.duration_minutes
          ? parseInt(prescription.duration_minutes)
          : null,
        frequency_per_week: prescription.frequency_per_week
          ? parseInt(prescription.frequency_per_week)
          : null,
        instructions: prescription.instructions || null,
        status: formData.status,
        notes: formData.notes || null,
      }));

      const { error } = await supabase
        .from('patient_exercise_prescriptions')
        .insert(prescriptionData);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error creating prescriptions:', error);
      alert('Error al crear las prescripciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">Información de la Prescripción</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin (opcional)
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'active' | 'paused' | 'completed',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="completed">Completado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Generales
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notas sobre el plan de ejercicios..."
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Ejercicios Prescritos</h3>
          <button
            type="button"
            onClick={addPrescription}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} />
            Agregar Ejercicio
          </button>
        </div>

        {/* Search and filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
          <div>
            <input
              type="text"
              placeholder="Buscar ejercicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {prescriptions.map((prescription, index) => {
          const selectedExercise = exercises.find((e) => e.id === prescription.exercise_id);

          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ejercicio *
                  </label>
                  <select
                    value={prescription.exercise_id}
                    onChange={(e) => updatePrescription(index, 'exercise_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar ejercicio...</option>
                    {filteredExercises.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name} {exercise.body_part ? `- ${exercise.body_part}` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedExercise && selectedExercise.description && (
                    <p className="text-xs text-gray-500 mt-1">{selectedExercise.description}</p>
                  )}
                </div>
                {prescriptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrescription(index)}
                    className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Series</label>
                  <input
                    type="number"
                    min="0"
                    value={prescription.sets}
                    onChange={(e) => updatePrescription(index, 'sets', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeticiones
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={prescription.repetitions}
                    onChange={(e) => updatePrescription(index, 'repetitions', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={prescription.duration_minutes}
                    onChange={(e) => updatePrescription(index, 'duration_minutes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veces/semana
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    value={prescription.frequency_per_week}
                    onChange={(e) =>
                      updatePrescription(index, 'frequency_per_week', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instrucciones Específicas
                </label>
                <textarea
                  value={prescription.instructions}
                  onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instrucciones específicas para este ejercicio..."
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1 gap-2">
          <Save size={18} />
          {loading ? 'Guardando...' : 'Prescribir Ejercicios'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="px-6">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
