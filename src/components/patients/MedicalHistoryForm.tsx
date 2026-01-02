'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedicalHistoryFormProps {
  patientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MedicalHistoryForm({ patientId, onSuccess, onCancel }: MedicalHistoryFormProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    blood_type: '',
    height_cm: '',
    weight_kg: '',
    family_history: '',
    lifestyle_notes: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  });

  const [allergies, setAllergies] = useState<string[]>(['']);
  const [chronicConditions, setChronicConditions] = useState<string[]>(['']);
  const [currentMedications, setCurrentMedications] = useState<string[]>(['']);
  const [previousSurgeries, setPreviousSurgeries] = useState<string[]>(['']);

  useEffect(() => {
    fetchExistingData();
  }, [patientId]);

  const fetchExistingData = async () => {
    const { data } = await supabase
      .from('patient_medical_history')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (data) {
      setFormData({
        blood_type: data.blood_type || '',
        height_cm: data.height_cm?.toString() || '',
        weight_kg: data.weight_kg?.toString() || '',
        family_history: data.family_history || '',
        lifestyle_notes: data.lifestyle_notes || '',
        emergency_contact_name: data.emergency_contact_name || '',
        emergency_contact_phone: data.emergency_contact_phone || '',
        emergency_contact_relationship: data.emergency_contact_relationship || '',
      });
      setAllergies(data.allergies && data.allergies.length > 0 ? data.allergies : ['']);
      setChronicConditions(
        data.chronic_conditions && data.chronic_conditions.length > 0
          ? data.chronic_conditions
          : ['']
      );
      setCurrentMedications(
        data.current_medications && data.current_medications.length > 0
          ? data.current_medications
          : ['']
      );
      setPreviousSurgeries(
        data.previous_surgeries && data.previous_surgeries.length > 0
          ? data.previous_surgeries
          : ['']
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        patient_id: patientId,
        allergies: allergies.filter((a) => a.trim() !== ''),
        chronic_conditions: chronicConditions.filter((c) => c.trim() !== ''),
        current_medications: currentMedications.filter((m) => m.trim() !== ''),
        previous_surgeries: previousSurgeries.filter((s) => s.trim() !== ''),
        blood_type: formData.blood_type || null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        family_history: formData.family_history || null,
        lifestyle_notes: formData.lifestyle_notes || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relationship: formData.emergency_contact_relationship || null,
      };

      const { error } = await supabase
        .from('patient_medical_history')
        .upsert(payload, { onConflict: 'patient_id' });

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error saving medical history:', error);
      alert('Error al guardar el historial médico');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <h3 className="text-lg font-semibold">Información Física</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Sangre
            </label>
            <select
              value={formData.blood_type}
              onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
            <input
              type="number"
              step="0.1"
              value={formData.height_cm}
              onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="170"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="70"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Alergias</h3>
          <button
            type="button"
            onClick={() => setAllergies([...allergies, ''])}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
        {allergies.map((allergy, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={allergy}
              onChange={(e) => {
                const newAllergies = [...allergies];
                newAllergies[idx] = e.target.value;
                setAllergies(newAllergies);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Penicilina"
            />
            {allergies.length > 1 && (
              <button
                type="button"
                onClick={() => setAllergies(allergies.filter((_, i) => i !== idx))}
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
          <h3 className="text-lg font-semibold">Condiciones Crónicas</h3>
          <button
            type="button"
            onClick={() => setChronicConditions([...chronicConditions, ''])}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
        {chronicConditions.map((condition, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={condition}
              onChange={(e) => {
                const newConditions = [...chronicConditions];
                newConditions[idx] = e.target.value;
                setChronicConditions(newConditions);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Diabetes Tipo 2"
            />
            {chronicConditions.length > 1 && (
              <button
                type="button"
                onClick={() => setChronicConditions(chronicConditions.filter((_, i) => i !== idx))}
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
          <h3 className="text-lg font-semibold">Medicamentos Actuales</h3>
          <button
            type="button"
            onClick={() => setCurrentMedications([...currentMedications, ''])}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
        {currentMedications.map((medication, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={medication}
              onChange={(e) => {
                const newMedications = [...currentMedications];
                newMedications[idx] = e.target.value;
                setCurrentMedications(newMedications);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Ibuprofeno 400mg"
            />
            {currentMedications.length > 1 && (
              <button
                type="button"
                onClick={() => setCurrentMedications(currentMedications.filter((_, i) => i !== idx))}
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
          <h3 className="text-lg font-semibold">Cirugías Previas</h3>
          <button
            type="button"
            onClick={() => setPreviousSurgeries([...previousSurgeries, ''])}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
        {previousSurgeries.map((surgery, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={surgery}
              onChange={(e) => {
                const newSurgeries = [...previousSurgeries];
                newSurgeries[idx] = e.target.value;
                setPreviousSurgeries(newSurgeries);
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Apendicectomía (2020)"
            />
            {previousSurgeries.length > 1 && (
              <button
                type="button"
                onClick={() => setPreviousSurgeries(previousSurgeries.filter((_, i) => i !== idx))}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <X size={20} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">Información Adicional</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Historial Familiar
          </label>
          <textarea
            value={formData.family_history}
            onChange={(e) => setFormData({ ...formData, family_history: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enfermedades hereditarias, condiciones familiares relevantes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas de Estilo de Vida
          </label>
          <textarea
            value={formData.lifestyle_notes}
            onChange={(e) => setFormData({ ...formData, lifestyle_notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Hábitos de ejercicio, dieta, tabaquismo, alcohol, etc..."
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold">Contacto de Emergencia</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              value={formData.emergency_contact_name}
              onChange={(e) =>
                setFormData({ ...formData, emergency_contact_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.emergency_contact_phone}
              onChange={(e) =>
                setFormData({ ...formData, emergency_contact_phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+34 123 456 789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Relación</label>
            <input
              type="text"
              value={formData.emergency_contact_relationship}
              onChange={(e) =>
                setFormData({ ...formData, emergency_contact_relationship: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Cónyuge, Padre, Hijo"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1 gap-2">
          <Save size={18} />
          {loading ? 'Guardando...' : 'Guardar Historial Médico'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="px-6">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
