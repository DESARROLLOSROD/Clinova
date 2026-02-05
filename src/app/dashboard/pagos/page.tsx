'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { InvoiceGenerator } from '@/components/payments/InvoiceGenerator';
import { exportToExcel, exportToPdf } from '@/lib/exportUtils';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type PaymentMethod = 'cash' | 'card' | 'transfer' | 'insurance';
type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string | null;
  invoice_number: string | null;
  payment_date: string;
  created_at: string;
  patients: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  sessions: {
    id: string;
  } | null;
}

const methodLabels: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  insurance: 'Seguro',
};

const statusLabels: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  completed: 'Completado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

const statusColors: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400',
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
  refunded: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300',
};

export default function PaymentsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | ''>('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        patients (first_name, last_name, email, phone),
        sessions (id)
      `)
      .order('payment_date', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.patients.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.patients.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMethod = !filterMethod || payment.method === filterMethod;
    const matchesStatus = !filterStatus || payment.status === filterStatus;

    const paymentDate = new Date(payment.payment_date);
    const matchesStartDate = !startDate || paymentDate >= new Date(startDate);
    const matchesEndDate = !endDate || paymentDate <= new Date(endDate);

    return matchesSearch && matchesMethod && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const totalAmount = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingAmount = filteredPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const prepareExportData = (): any[] => {
    return filteredPayments.map(p => ({
      date: new Date(p.payment_date).toLocaleDateString('es-ES'),
      patient: `${p.patients.first_name} ${p.patients.last_name}`,
      amount: p.amount,
      method: methodLabels[p.method] || p.method,
      status: statusLabels[p.status] || p.status,
      concept: p.description || (p.sessions ? 'Sesión' : 'Consulta')
    }))
  }

  const exportColumns = [
    { header: 'Fecha', key: 'date', width: 15 },
    { header: 'Paciente', key: 'patient', width: 25 },
    { header: 'Concepto', key: 'concept', width: 25 },
    { header: 'Monto', key: 'amount', width: 15 },
    { header: 'Método', key: 'method', width: 15 },
    { header: 'Estado', key: 'status', width: 15 },
  ]

  const handleExportExcel = async () => {
    const data = prepareExportData()
    await exportToExcel(data, exportColumns, `Reporte_Pagos_${new Date().toISOString().split('T')[0]}`)
  }

  const handleExportPdf = () => {
    const data = prepareExportData()
    exportToPdf(data, exportColumns, `Reporte_Pagos_${new Date().toISOString().split('T')[0]}`, 'Reporte de Pagos')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Pagos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gestión de pagos y facturación</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download size={16} />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                <FileSpreadsheet size={16} className="text-green-600" /> Excel (.xlsx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPdf} className="gap-2 cursor-pointer">
                <FileText size={16} className="text-red-600" /> PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => router.push('/dashboard/pagos/nuevo')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Registrar Pago
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-800 transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Cobrado</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-800 transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pendiente de Cobro</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">${pendingAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-800 transition-colors">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total de Pagos</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{filteredPayments.length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-100 dark:border-gray-800 mb-6 transition-colors">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Buscar paciente o factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | '')}
            className="px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los métodos</option>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="insurance">Seguro</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | '')}
            className="px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="completed">Completado</option>
            <option value="pending">Pendiente</option>
            <option value="cancelled">Cancelado</option>
            <option value="refunded">Reembolsado</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Desde"
            className="px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Hasta"
            className="px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(searchTerm || filterMethod || filterStatus || startDate || endDate) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterMethod('');
              setFilterStatus('');
              setStartDate('');
              setEndDate('');
            }}
            className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando pagos...</div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No se encontraron pagos</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sesión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {new Date(payment.payment_date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {payment.patients.first_name} {payment.patients.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {methodLabels[payment.method]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[payment.status]}`}>
                      {statusLabels[payment.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {payment.invoice_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {payment.sessions ? '✓' : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    <InvoiceGenerator payment={payment} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
