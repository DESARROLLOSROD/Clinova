'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, DollarSign, Dumbbell, FileText, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrescriptionForm } from '@/components/exercises/PrescriptionForm';
import { TreatmentPlanAssignment } from '@/components/treatments/TreatmentPlanAssignment';

interface PatientActionsProps {
  patientId: string;
}

export function PatientActions({ patientId }: PatientActionsProps) {
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showTreatmentPlanForm, setShowTreatmentPlanForm] = useState(false);

  if (showPrescriptionForm) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Prescribir Ejercicios</h2>
        <PrescriptionForm
          patientId={patientId}
          onSuccess={() => {
            setShowPrescriptionForm(false);
            window.location.reload();
          }}
          onCancel={() => setShowPrescriptionForm(false)}
        />
      </div>
    );
  }

  if (showTreatmentPlanForm) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <TreatmentPlanAssignment
          patientId={patientId}
          onSuccess={() => {
            setShowTreatmentPlanForm(false);
            window.location.reload();
          }}
          onCancel={() => setShowTreatmentPlanForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/dashboard/agenda/nueva?patient_id=${patientId}`}>
        <Button size="sm" className="gap-2">
          <Calendar size={16} />
          Nueva Cita
        </Button>
      </Link>
      <Link href={`/dashboard/pagos/nuevo?patient_id=${patientId}`}>
        <Button size="sm" variant="outline" className="gap-2">
          <DollarSign size={16} />
          Registrar Pago
        </Button>
      </Link>
      <button
        onClick={() => setShowPrescriptionForm(true)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
      >
        <Dumbbell size={16} />
        Prescribir Ejercicios
      </button>
      <button
        onClick={() => setShowTreatmentPlanForm(true)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
      >
        <Activity size={16} />
        Asignar Plan
      </button>
      <Link href={`/dashboard/pacientes/${patientId}/evaluacion`}>
        <Button size="sm" variant="outline" className="gap-2">
          <FileText size={16} />
          Evaluación Inicial
        </Button>
      </Link>
    </div>
  );
}
