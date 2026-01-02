'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FileText, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TreatmentPlanAssignmentProps {
  patientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  estimated_duration_weeks: number;
  treatment_objectives: string[];
}

export function TreatmentPlanAssignment({
  patientId,
  onSuccess,
  onCancel,
}: TreatmentPlanAssignmentProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [formData, setFormData] = useState({
    template_id: '',
    start_date: new Date().toISOString().slice(0, 10),
    planned_end_date: '',
    status: 'active' as 'active' | 'paused' | 'completed' | 'cancelled',
    custom_notes: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('treatment_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setTemplates(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();

      if (!formData.template_id) {
        alert('Debes seleccionar una plantilla de tratamiento');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('patient_treatment_plans').insert({
        patient_id: patientId,
        template_id: formData.template_id,
        assigned_by: user.user?.id,
        start_date: formData.start_date,
        planned_end_date: formData.planned_end_date || null,
        status: formData.status,
        custom_notes: formData.custom_notes || null,
      });

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error assigning treatment plan:', error);
      alert('Error al asignar el plan de tratamiento');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(
    (template) => selectedCategory === '' || template.category === selectedCategory
  );

  const categories = Array.from(new Set(templates.map((t) => t.category).filter(Boolean)));

  const selectedTemplate = templates.find((t) => t.id === formData.template_id);

  // Auto-calculate planned end date based on template duration
  useEffect(() => {
    if (selectedTemplate && formData.start_date && !formData.planned_end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + selectedTemplate.estimated_duration_weeks * 7);
      setFormData((prev) => ({
        ...prev,
        planned_end_date: endDate.toISOString().slice(0, 10),
      }));
    }
  }, [selectedTemplate, formData.start_date]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="text-purple-600" size={20} />
          Asignar Plan de Tratamiento
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Categoría
          </label>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Plantilla de Tratamiento *
          </label>
          <select
            required
            value={formData.template_id}
            onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar plantilla...</option>
            {filteredTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.estimated_duration_weeks} semanas
              </option>
            ))}
          </select>
        </div>

        {selectedTemplate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">{selectedTemplate.name}</h4>
            {selectedTemplate.description && (
              <p className="text-sm text-blue-800 mb-3">{selectedTemplate.description}</p>
            )}
            {selectedTemplate.treatment_objectives &&
              selectedTemplate.treatment_objectives.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Objetivos:</p>
                  <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                    {selectedTemplate.treatment_objectives.map((objective, idx) => (
                      <li key={idx}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

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
              Fecha Planificada de Fin
            </label>
            <input
              type="date"
              value={formData.planned_end_date}
              onChange={(e) => setFormData({ ...formData, planned_end_date: e.target.value })}
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
                  status: e.target.value as 'active' | 'paused' | 'completed' | 'cancelled',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Personalizadas
          </label>
          <textarea
            value={formData.custom_notes}
            onChange={(e) => setFormData({ ...formData, custom_notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Modificaciones o notas específicas para este paciente..."
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1 gap-2">
          <Save size={18} />
          {loading ? 'Asignando...' : 'Asignar Plan de Tratamiento'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="px-6">
          <X size={16} />
          Cancelar
        </Button>
      </div>
    </form>
  );
}
