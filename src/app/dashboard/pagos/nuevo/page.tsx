'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type PaymentMethod = 'cash' | 'card' | 'transfer' | 'insurance';
type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface Session {
  id: string;
  appointment_id: string;
  created_at: string;
  appointments: {
    title: string;
    start_time: string;
  };
}

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: searchParams.get('patient_id') || '',
    session_id: searchParams.get('session_id') || '',
    amount: '',
    method: 'cash' as PaymentMethod,
    status: 'completed' as PaymentStatus,
    description: '',
    invoice_number: '',
    payment_date: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (formData.patient_id) {
      fetchPatientSessions(formData.patient_id);
    } else {
      setSessions([]);
    }
  }, [formData.patient_id]);

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .order('first_name');

    if (error) {
      console.error('Error fetching patients:', error);
      return;
    }

    setPatients(data || []);
  };

  const fetchPatientSessions = async (patientId: string) => {
    setLoadingSessions(true);
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        id,
        appointment_id,
        created_at,
        appointments (
          title,
          start_time
        )
      `)
      .eq('appointments.patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
    } else {
      setSessions((data as any) || []);
    }
    setLoadingSessions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('payments').insert({
        patient_id: formData.patient_id,
        session_id: formData.session_id || null,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        description: formData.description || null,
        invoice_number: formData.invoice_number || null,
        payment_date: formData.payment_date,
      });

      if (error) throw error;

      router.push('/dashboard/pagos');
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error al crear el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Registrar Pago</h1>
        <p className="text-gray-600 mt-2">Ingresa los detalles del pago recibido</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700 mb-2">
            Paciente *
          </label>
          <select
            id="patient_id"
            required
            value={formData.patient_id}
            onChange={(e) => setFormData({ ...formData, patient_id: e.target.value, session_id: '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar paciente</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.first_name} {patient.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="session_id" className="block text-sm font-medium text-gray-700 mb-2">
            Sesión (Opcional)
          </label>
          <select
            id="session_id"
            value={formData.session_id}
            onChange={(e) => setFormData({ ...formData, session_id: e.target.value })}
            disabled={!formData.patient_id || loadingSessions}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Sin sesión asociada</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.appointments?.title || 'Sesión'} - {new Date(session.appointments?.start_time || session.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
          {loadingSessions && <p className="text-sm text-gray-500 mt-1">Cargando sesiones...</p>}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Monto *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              id="amount"
              required
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pago *
            </label>
            <select
              id="method"
              required
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value as PaymentMethod })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
              <option value="insurance">Seguro</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              id="status"
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
              <option value="cancelled">Cancelado</option>
              <option value="refunded">Reembolsado</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Pago *
          </label>
          <input
            type="datetime-local"
            id="payment_date"
            required
            value={formData.payment_date}
            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700 mb-2">
            Número de Factura (Opcional)
          </label>
          <input
            type="text"
            id="invoice_number"
            value={formData.invoice_number}
            onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: FAC-2024-001"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (Opcional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notas adicionales sobre el pago..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Guardando...' : 'Registrar Pago'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
