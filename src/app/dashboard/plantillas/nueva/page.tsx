'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { ArrowLeft, Plus, X, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Technique {
  name: string;
  description: string;
  duration_minutes: string;
}

export default function NewTreatmentTemplatePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration_minutes: '',
    frequency: '',
    notes: '',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    is_active: true,
  });

  const [objectives, setObjectives] = useState<string[]>(['']);
  const [contraindications, setContraindications] = useState<string[]>(['']);
  const [techniques, setTechniques] = useState<Technique[]>([
    { name: '', description: '', duration_minutes: '' },
  ]);

  const addObjective = () => setObjectives([...objectives, '']);
  const removeObjective = (index: number) =>
    setObjectives(objectives.filter((_, i) => i !== index));
  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const addContraindication = () => setContraindications([...contraindications, '']);
  const removeContraindication = (index: number) =>
    setContraindications(contraindications.filter((_, i) => i !== index));
  const updateContraindication = (index: number, value: string) => {
    const newContraindications = [...contraindications];
    newContraindications[index] = value;
    setContraindications(newContraindications);
  };

  const addTechnique = () =>
    setTechniques([...techniques, { name: '', description: '', duration_minutes: '' }]);
  const removeTechnique = (index: number) =>
    setTechniques(techniques.filter((_, i) => i !== index));
  const updateTechnique = (index: number, field: keyof Technique, value: string) => {
    const newTechniques = [...techniques];
    newTechniques[index][field] = value;
    setTechniques(newTechniques);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();

      // Crear plantilla
      const { data: template, error: templateError } = await supabase
        .from('treatment_templates')
        .insert({
          name: formData.name,
          description: formData.description || null,
          category: formData.category || null,
          duration_minutes: formData.duration_minutes
            ? parseInt(formData.duration_minutes)
            : null,
          frequency: formData.frequency || null,
          objectives: objectives.filter((o) => o.trim() !== ''),
          contraindications: contraindications.filter((c) => c.trim() !== ''),
          notes: formData.notes || null,
          subjective: formData.subjective || null,
          objective: formData.objective || null,
          assessment: formData.assessment || null,
          plan: formData.plan || null,
          created_by: user.user?.id,
          is_active: formData.is_active,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Crear técnicas asociadas
      const techniquesToInsert = techniques
        .filter((t) => t.name.trim() !== '')
        .map((t, index) => ({
          template_id: template.id,
          name: t.name,
          description: t.description || null,
          duration_minutes: t.duration_minutes ? parseInt(t.duration_minutes) : null,
          order_index: index,
        }));

      if (techniquesToInsert.length > 0) {
        const { error: techniquesError } = await supabase
          .from('template_techniques')
          .insert(techniquesToInsert);

        if (techniquesError) throw techniquesError;
      }

      router.push('/dashboard/plantillas');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Error al crear la plantilla');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/plantillas">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nueva Plantilla de Tratamiento</h1>
        <p className="text-gray-600 mt-2">
          Crea una plantilla reutilizable para tratamientos comunes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold">Información Básica</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Plantilla *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Rehabilitación de Hombro Post-Cirugía"
              />
            </div>

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
                placeholder="Ej: Ortopedia, Neurología, Deportiva"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe brevemente el propósito de esta plantilla..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="duration_minutes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Duración Estimada (minutos)
              </label>
              <input
                type="number"
                id="duration_minutes"
                min="0"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="60"
              />
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                Frecuencia Recomendada
              </label>
              <input
                type="text"
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 2-3 veces por semana"
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
              Plantilla activa (disponible para usar)
            </label>
          </div>
        </div>

        {/* Sección SOAP */}
        < div className="bg-white p-6 rounded-lg shadow space-y-6" >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="text-blue-600" size={24} />
            Estructura SOAP (Opcional)
          </h2>
          <p className="text-sm text-gray-500">
            Define el contenido predeterminado para las notas de sesión. Esto agilizará el llenado durante la consulta.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="subjective" className="block text-sm font-medium text-gray-700 mb-2">
                Subjetivo (S)
              </label>
              <textarea
                id="subjective"
                value={formData.subjective}
                onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-blue-100 bg-blue-50/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Paciente refiere dolor punzante en..."
              />
            </div>
            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-2">
                Objetivo (O)
              </label>
              <textarea
                id="objective"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-blue-100 bg-blue-50/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Palpación dolorosa en..."
              />
            </div>
            <div>
              <label htmlFor="assessment" className="block text-sm font-medium text-gray-700 mb-2">
                Análisis (A)
              </label>
              <textarea
                id="assessment"
                value={formData.assessment}
                onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-blue-100 bg-blue-50/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Signos compatibles con..."
              />
            </div>
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">
                Plan (P)
              </label>
              <textarea
                id="plan"
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-blue-100 bg-blue-50/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Aplicación de ultrasonido 5 min..."
              />
            </div>
          </div>
        </div >

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Objetivos del Tratamiento</h2>
            <button
              type="button"
              onClick={addObjective}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              Agregar Objetivo
            </button>
          </div>

          {objectives.map((objective, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={objective}
                onChange={(e) => updateObjective(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Reducir dolor e inflamación"
              />
              {objectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeObjective(index)}
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
                placeholder="Ej: Fractura no consolidada"
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

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Técnicas y Procedimientos</h2>
            <button
              type="button"
              onClick={addTechnique}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              Agregar Técnica
            </button>
          </div>

          {techniques.map((technique, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">Técnica {index + 1}</span>
                {techniques.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTechnique(index)}
                    className="text-red-600 hover:bg-red-50 rounded p-1"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={technique.name}
                    onChange={(e) => updateTechnique(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre de la técnica"
                  />
                </div>

                <div className="md:col-span-2">
                  <textarea
                    value={technique.description}
                    onChange={(e) => updateTechnique(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción de la técnica"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    min="0"
                    value={technique.duration_minutes}
                    onChange={(e) => updateTechnique(index, 'duration_minutes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Duración (min)"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notas Adicionales
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cualquier información adicional relevante..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Guardando...' : 'Crear Plantilla'}
          </button>
          <Link href="/dashboard/plantillas" className="flex-1">
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
