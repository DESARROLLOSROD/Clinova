import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PatientActions } from '@/components/patients/PatientActions';
import { MedicalHistorySection } from '@/components/patients/MedicalHistorySection';
import { PatientPrescriptionsView } from '@/components/patients/PatientPrescriptionsView';

export const dynamic = 'force-dynamic';

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  payment_date: string;
  invoice_number: string | null;
  sessions: { id: string } | null;
}

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  sessions: { id: string }[];
}

interface Session {
  id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  pain_level: number | null;
  created_at: string;
  appointments: {
    title: string;
    start_time: string;
  };
}

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !patient) {
    notFound();
  }

  const { data: payments } = await supabase
    .from('payments')
    .select('*, sessions(id)')
    .eq('patient_id', id)
    .order('payment_date', { ascending: false })
    .limit(10);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, sessions(id)')
    .eq('patient_id', id)
    .order('start_time', { ascending: false })
    .limit(10);

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      appointments (
        title,
        start_time
      )
    `)
    .eq('appointments.patient_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  const totalPaid = (payments || [])
    .filter((p: Payment) => p.status === 'completed')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  const pendingPayments = (payments || [])
    .filter((p: Payment) => p.status === 'pending')
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  const methodLabels: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    insurance: 'Seguro',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
    scheduled: 'Programada',
    no_show: 'No asistió',
  };

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  };

  const appointmentStatusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pacientes">
          <Button variant="outline" size="sm">
            <ArrowLeft size={18} className="mr-2" />
            Volver
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="text-gray-900">{patient.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Teléfono:</span>
                <p className="text-gray-900">{patient.phone}</p>
              </div>
              {patient.date_of_birth && (
                <div>
                  <span className="text-gray-500">Fecha de Nacimiento:</span>
                  <p className="text-gray-900">
                    {new Date(patient.date_of_birth).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Estado:</span>
                <span
                  className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    patient.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {patient.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
            {patient.notes && (
              <div className="mt-4">
                <span className="text-gray-500 text-sm">Notas:</span>
                <p className="text-gray-900 mt-1">{patient.notes}</p>
              </div>
            )}
          </div>
          <PatientActions patientId={patient.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total Pagado</p>
          <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-600">Pendiente de Pago</p>
          <p className="text-2xl font-bold text-yellow-600">${pendingPayments.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total Sesiones</p>
          <p className="text-2xl font-bold text-blue-600">{sessions?.length || 0}</p>
        </div>
      </div>

      <MedicalHistorySection patientId={patient.id} />

      <PatientPrescriptionsView patientId={patient.id} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              Citas Recientes
            </h2>
            <Link href="/dashboard/agenda">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((appointment: Appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(appointment.start_time).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        appointmentStatusColors[appointment.status]
                      }`}
                    >
                      {statusLabels[appointment.status]}
                    </span>
                  </div>
                  {appointment.sessions && appointment.sessions.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <FileText size={14} />
                      <span>Nota de sesión registrada</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay citas registradas</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="text-green-600" size={20} />
              Historial de Pagos
            </h2>
            <Link href="/dashboard/pagos">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </div>
          {payments && payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment: Payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">${payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {methodLabels[payment.method]} -{' '}
                        {new Date(payment.payment_date).toLocaleDateString('es-ES')}
                      </p>
                      {payment.invoice_number && (
                        <p className="text-xs text-gray-500 mt-1">Factura: {payment.invoice_number}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        paymentStatusColors[payment.status]
                      }`}
                    >
                      {statusLabels[payment.status]}
                    </span>
                  </div>
                  {payment.sessions && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <FileText size={14} />
                      <span>Asociado a sesión</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay pagos registrados</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="text-purple-600" size={20} />
          Notas de Sesiones (SOAP)
        </h2>
        {sessions && sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session: Session) => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.appointments?.title || 'Sesión'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(
                        session.appointments?.start_time || session.created_at
                      ).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {session.pain_level !== null && (
                    <div className="text-sm">
                      <span className="text-gray-600">Dolor: </span>
                      <span className="font-semibold text-red-600">{session.pain_level}/10</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {session.subjective && (
                    <div>
                      <p className="font-semibold text-gray-700">Subjetivo (S):</p>
                      <p className="text-gray-600">{session.subjective}</p>
                    </div>
                  )}
                  {session.objective && (
                    <div>
                      <p className="font-semibold text-gray-700">Objetivo (O):</p>
                      <p className="text-gray-600">{session.objective}</p>
                    </div>
                  )}
                  {session.assessment && (
                    <div>
                      <p className="font-semibold text-gray-700">Evaluación (A):</p>
                      <p className="text-gray-600">{session.assessment}</p>
                    </div>
                  )}
                  {session.plan && (
                    <div>
                      <p className="font-semibold text-gray-700">Plan (P):</p>
                      <p className="text-gray-600">{session.plan}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay notas de sesiones registradas</p>
        )}
      </div>
    </div>
  );
}
