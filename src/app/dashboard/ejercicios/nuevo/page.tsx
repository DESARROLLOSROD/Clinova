'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewExercisePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    body_part: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    instructions: '',
    video_url: '',
    image_url: '',
    is_active: true,
  });

  const [equipmentNeeded, setEquipmentNeeded] = useState<string[]>(['']);
  const [contraindications, setContraindications] = useState<string[]>(['']);

  const addEquipment = () => setEquipmentNeeded([...equipmentNeeded, '']);
  const removeEquipment = (index: number) =>
    setEquipmentNeeded(equipmentNeeded.filter((_, i) => i !== index));
  const updateEquipment = (index: number, value: string) => {
    const newEquipment = [...equipmentNeeded];
    newEquipment[index] = value;
    setEquipmentNeeded(newEquipment);
  };

  const addContraindication = () => setContraindications([...contraindications, '']);
  const removeContraindication = (index: number) =>
    setContraindications(contraindications.filter((_, i) => i !== index));
  const updateContraindication = (index: number, value: string) => {
    const newContraindications = [...contraindications];
    newContraindications[index] = value;
    setContraindications(newContraindications);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase.from('exercise_library').insert({
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        body_part: formData.body_part || null,
        difficulty: formData.difficulty,
        equipment_needed: equipmentNeeded.filter((e) => e.trim() !== ''),
        instructions: formData.instructions || null,
        video_url: formData.video_url || null,
        image_url: formData.image_url || null,
        contraindications: contraindications.filter((c) => c.trim() !== ''),
        created_by: user.user?.id,
        is_active: formData.is_active,
      });

      if (error) throw error;

      router.push('/dashboard/ejercicios');
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert('Error al crear el ejercicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/ejercicios">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nuevo Ejercicio</h1>
        <p className="text-gray-600 mt-2">Agrega un nuevo ejercicio a tu biblioteca</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold">Información Básica</h2>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Ejercicio *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Elevación lateral de hombro"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Breve
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción corta del ejercicio..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Fuerza, Flexibilidad..."
              />
            </div>

            <div>
              <label htmlFor="body_part" className="block text-sm font-medium text-gray-700 mb-2">
                Zona Corporal
              </label>
              <input
                type="text"
                id="body_part"
                value={formData.body_part}
                onChange={(e) => setFormData({ ...formData, body_part: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hombro, Rodilla..."
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Dificultad
              </label>
              <select
                id="difficulty"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
              Instrucciones Detalladas
            </label>
            <textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Escribe las instrucciones paso a paso para realizar el ejercicio..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-2">
                URL del Video (opcional)
              </label>
              <input
                type="url"
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://youtube.com/..."
              />
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                URL de Imagen (opcional)
              </label>
              <input
                type="url"
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Ejercicio activo (visible en la biblioteca)
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Equipamiento Necesario</h2>
            <button
              type="button"
              onClick={addEquipment}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              Agregar Equipo
            </button>
          </div>

          {equipmentNeeded.map((equipment, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={equipment}
                onChange={(e) => updateEquipment(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Banda elástica, Mancuerna"
              />
              {equipmentNeeded.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEquipment(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Contraindicaciones</h2>
            <button
              type="button"
              onClick={addContraindication}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              Agregar Contraindicación
            </button>
          </div>

          {contraindications.map((contraindication, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={contraindication}
                onChange={(e) => updateContraindication(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Lesión aguda de hombro"
              />
              {contraindications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeContraindication(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Guardando...' : 'Crear Ejercicio'}
          </button>
          <Link href="/dashboard/ejercicios" className="flex-1">
            <button
              type="button"
              className="w-full py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
