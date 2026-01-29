'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Heart, AlertCircle, Pill, Scissors, Users, Phone, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MedicalHistory {
  id: string;
  allergies: string[] | null;
  chronic_conditions: string[] | null;
  current_medications: string[] | null;
  previous_surgeries: string[] | null;
  family_history: string | null;
  lifestyle_notes: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  blood_type: string | null;
  height_cm: number | null;
  weight_kg: number | null;
}

interface MedicalHistorySectionProps {
  patientId: string;
}

export function MedicalHistorySection({ patientId }: MedicalHistorySectionProps) {
  const supabase = createClient();
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchMedicalHistory();
  }, [patientId]);

  const fetchMedicalHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patient_medical_history')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching medical history:', error);
    }

    setMedicalHistory(data);
    setLoading(false);
  };

  const calculateBMI = () => {
    if (medicalHistory?.height_cm && medicalHistory?.weight_kg) {
      const heightM = medicalHistory.height_cm / 100;
      const bmi = medicalHistory.weight_kg / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-center text-gray-500">Cargando historial médico...</p>
      </div>
    );
  }

  if (!medicalHistory) {
    return (
      <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Sin Historial Médico</h3>
          <p className="mt-2 text-sm text-gray-500">
            No hay información médica registrada para este paciente.
          </p>
          <Button className="mt-4" onClick={() => setIsEditing(true)}>
            Agregar Historial Médico
          </Button>
        </div>
      </div>
    );
  }

  const bmi = calculateBMI();

  return (
    <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Heart className="text-red-600" size={20} />
          Historial Médico
        </h2>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Edit size={16} className="mr-2" />
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Física */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2">Información Física</h3>

          {medicalHistory.blood_type && (
            <div>
              <p className="text-sm text-gray-600">Tipo de Sangre</p>
              <p className="font-medium text-gray-900">{medicalHistory.blood_type}</p>
            </div>
          )}

          {medicalHistory.height_cm && (
            <div>
              <p className="text-sm text-gray-600">Altura</p>
              <p className="font-medium text-gray-900">{medicalHistory.height_cm} cm</p>
            </div>
          )}

          {medicalHistory.weight_kg && (
            <div>
              <p className="text-sm text-gray-600">Peso</p>
              <p className="font-medium text-gray-900">{medicalHistory.weight_kg} kg</p>
            </div>
          )}

          {bmi && (
            <div>
              <p className="text-sm text-gray-600">IMC</p>
              <p className="font-medium text-gray-900">{bmi}</p>
            </div>
          )}
        </div>

        {/* Contacto de Emergencia */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 border-b pb-2">Contacto de Emergencia</h3>

          {medicalHistory.emergency_contact_name && (
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Users size={14} />
                Nombre
              </p>
              <p className="font-medium text-gray-900">{medicalHistory.emergency_contact_name}</p>
            </div>
          )}

          {medicalHistory.emergency_contact_phone && (
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Phone size={14} />
                Teléfono
              </p>
              <p className="font-medium text-gray-900">{medicalHistory.emergency_contact_phone}</p>
            </div>
          )}

          {medicalHistory.emergency_contact_relationship && (
            <div>
              <p className="text-sm text-gray-600">Relación</p>
              <p className="font-medium text-gray-900">
                {medicalHistory.emergency_contact_relationship}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Alergias */}
        {medicalHistory.allergies && medicalHistory.allergies.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-600" />
              Alergias
            </p>
            <div className="flex flex-wrap gap-2">
              {medicalHistory.allergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-red-50 text-red-800 rounded-full text-sm"
                >
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Condiciones Crónicas */}
        {medicalHistory.chronic_conditions && medicalHistory.chronic_conditions.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <Heart size={16} className="text-orange-600" />
              Condiciones Crónicas
            </p>
            <div className="flex flex-wrap gap-2">
              {medicalHistory.chronic_conditions.map((condition, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-orange-50 text-orange-800 rounded-full text-sm"
                >
                  {condition}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Medicamentos Actuales */}
        {medicalHistory.current_medications && medicalHistory.current_medications.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <Pill size={16} className="text-blue-600" />
              Medicamentos Actuales
            </p>
            <div className="flex flex-wrap gap-2">
              {medicalHistory.current_medications.map((medication, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm"
                >
                  {medication}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cirugías Previas */}
        {medicalHistory.previous_surgeries && medicalHistory.previous_surgeries.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
              <Scissors size={16} className="text-purple-600" />
              Cirugías Previas
            </p>
            <div className="flex flex-wrap gap-2">
              {medicalHistory.previous_surgeries.map((surgery, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-50 text-purple-800 rounded-full text-sm"
                >
                  {surgery}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Historial Familiar */}
        {medicalHistory.family_history && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Historial Familiar</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {medicalHistory.family_history}
            </p>
          </div>
        )}

        {/* Notas de Estilo de Vida */}
        {medicalHistory.lifestyle_notes && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Estilo de Vida</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {medicalHistory.lifestyle_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
