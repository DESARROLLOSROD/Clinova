'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function InitialAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    assessment_date: new Date().toISOString().slice(0, 10),
    chief_complaint: '',
    history_of_present_illness: '',
    pain_description: '',
    pain_location: '',
    pain_intensity: '',
    onset_date: '',
    functional_limitations: '',
    previous_treatments: '',
    assessment_findings: '',
    diagnosis: '',
    recommended_treatment_plan: '',
    prognosis: '',
    notes: '',
  });

  const [treatmentGoals, setTreatmentGoals] = useState<string[]>(['']);
  const [aggravatingFactors, setAggravatingFactors] = useState<string[]>(['']);
  const [relievingFactors, setRelievingFactors] = useState<string[]>(['']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase.from('initial_assessments').insert({
        patient_id: patientId,
        assessed_by: user.user?.id,
        assessment_date: formData.assessment_date,
        chief_complaint: formData.chief_complaint,
        history_of_present_illness: formData.history_of_present_illness || null,
        pain_description: formData.pain_description || null,
        pain_location: formData.pain_location || null,
        pain_intensity: formData.pain_intensity ? parseInt(formData.pain_intensity) : null,
        onset_date: formData.onset_date || null,
        aggravating_factors: aggravatingFactors.filter((f) => f.trim() !== ''),
        relieving_factors: relievingFactors.filter((f) => f.trim() !== ''),
        functional_limitations: formData.functional_limitations || null,
        previous_treatments: formData.previous_treatments || null,
        assessment_findings: formData.assessment_findings || null,
        diagnosis: formData.diagnosis || null,
        treatment_goals: treatmentGoals.filter((g) => g.trim() !== ''),
        recommended_treatment_plan: formData.recommended_treatment_plan || null,
        prognosis: formData.prognosis || null,
        notes: formData.notes || null,
      });

      if (error) throw error;

      router.push(`/dashboard/pacientes/${patientId}`);
    } catch (error) {
      console.error('Error creating assessment:', error);
      alert('Error al crear la evaluación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href={`/dashboard/pacientes/${patientId}`}>
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Volver al Paciente
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Evaluación Inicial</h1>
        <p className="text-gray-600 mt-2">Registro completo de la evaluación del paciente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold">Información General</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Evaluación *
              </label>
              <input
                type="date"
                required
                value={formData.assessment_date}
                onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de Consulta Principal *
            </label>
            <textarea
              required
              value={formData.chief_complaint}
              onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="¿Por qué acude el paciente?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Historia de la Enfermedad Actual
            </label>
            <textarea
              value={formData.history_of_present_illness}
              onChange={(e) =>
                setFormData({ ...formData, history_of_present_illness: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cronología y evolución de los síntomas..."
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold">Dolor</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localización del Dolor
              </label>
              <input
                type="text"
                value={formData.pain_location}
                onChange={(e) => setFormData({ ...formData, pain_location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Hombro derecho"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensidad del Dolor (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.pain_intensity}
                onChange={(e) => setFormData({ ...formData, pain_intensity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Dolor
            </label>
            <textarea
              value={formData.pain_description}
              onChange={(e) => setFormData({ ...formData, pain_description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tipo de dolor: punzante, sordo, ardiente, etc..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={formData.onset_date}
              onChange={(e) => setFormData({ ...formData, onset_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Factores Agravantes</h2>
            <button
              type="button"
              onClick={() => setAggravatingFactors([...aggravatingFactors, ''])}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              Agregar
            </button>
          </div>
          {aggravatingFactors.map((factor, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={factor}
                onChange={(e) => {
                  const newFactors = [...aggravatingFactors];
                  newFactors[idx] = e.target.value;
                  setAggravatingFactors(newFactors);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Movimientos de elevación"
              />
              {aggravatingFactors.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setAggravatingFactors(aggravatingFactors.filter((_, i) => i !== idx))
                  }
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
            <h2 className="text-xl font-semibold">Factores que Alivian</h2>
            <button
              type="button"
              onClick={() => setRelievingFactors([...relievingFactors, ''])}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              Agregar
            </button>
          </div>
          {relievingFactors.map((factor, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={factor}
                onChange={(e) => {
                  const newFactors = [...relievingFactors];
                  newFactors[idx] = e.target.value;
                  setRelievingFactors(newFactors);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Reposo, hielo"
              />
              {relievingFactors.length > 1 && (
                <button
                  type="button"
                  onClick={() => setRelievingFactors(relievingFactors.filter((_, i) => i !== idx))}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold">Evaluación y Plan</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limitaciones Funcionales
            </label>
            <textarea
              value={formData.functional_limitations}
              onChange={(e) =>
                setFormData({ ...formData, functional_limitations: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Actividades que el paciente no puede realizar..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tratamientos Previos
            </label>
            <textarea
              value={formData.previous_treatments}
              onChange={(e) => setFormData({ ...formData, previous_treatments: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tratamientos ya realizados y resultados..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hallazgos de la Evaluación
            </label>
            <textarea
              value={formData.assessment_findings}
              onChange={(e) => setFormData({ ...formData, assessment_findings: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observaciones, pruebas realizadas, ROM, fuerza..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Diagnóstico fisioterapéutico..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Objetivos del Tratamiento
              </label>
              <button
                type="button"
                onClick={() => setTreatmentGoals([...treatmentGoals, ''])}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus size={16} />
                Agregar
              </button>
            </div>
            {treatmentGoals.map((goal, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => {
                    const newGoals = [...treatmentGoals];
                    newGoals[idx] = e.target.value;
                    setTreatmentGoals(newGoals);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Reducir dolor a 3/10 en 4 semanas"
                />
                {treatmentGoals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setTreatmentGoals(treatmentGoals.filter((_, i) => i !== idx))}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan de Tratamiento Recomendado
            </label>
            <textarea
              value={formData.recommended_treatment_plan}
              onChange={(e) =>
                setFormData({ ...formData, recommended_treatment_plan: e.target.value })
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Técnicas, frecuencia, duración estimada..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pronóstico</label>
            <textarea
              value={formData.prognosis}
              onChange={(e) => setFormData({ ...formData, prognosis: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Expectativas de recuperación..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cualquier información adicional relevante..."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Guardando...' : 'Guardar Evaluación Inicial'}
          </button>
          <Link href={`/dashboard/pacientes/${patientId}`} className="flex-1">
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
