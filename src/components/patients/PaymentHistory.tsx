'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DollarSign, FileText, Download } from 'lucide-react';
import { generateReceipt } from '@/utils/pdf/ReceiptGenerator';

interface Payment {
    id: string;
    amount: number;
    method: string;
    status: string;
    payment_date: string;
    invoice_number: string | null;
    sessions: { id: string } | null;
}

interface ClinicData {
    name: string;
    logo_url?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    website?: string;
}

interface PaymentHistoryProps {
    payments: Payment[];
    patientName: string;
    clinicData?: ClinicData;
}

export function PaymentHistory({ payments, patientName, clinicData }: PaymentHistoryProps) {
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
    };

    const paymentStatusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        refunded: 'bg-gray-100 text-gray-800',
    };

    const handleDownload = async (payment: Payment) => {
        await generateReceipt({
            id: payment.id,
            amount: payment.amount,
            method: methodLabels[payment.method] || payment.method,
            status: payment.status,
            payment_date: payment.payment_date,
            invoice_number: payment.invoice_number,
            patientName: patientName,
            concept: payment.sessions ? 'Pago de Sesión de Fisioterapia' : 'Pago de Servicios Clínicos',
            clinic: clinicData
        });
    };

    return (
        <div className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-100 p-6">
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
                    {payments.map((payment) => (
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
                                <div className="flex flex-col items-end gap-2">
                                    <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[payment.status]
                                            }`}
                                    >
                                        {statusLabels[payment.status]}
                                    </span>

                                    {/* Download Receipt Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 px-2 text-xs gap-1 text-gray-600"
                                        onClick={() => handleDownload(payment)}
                                    >
                                        <Download size={12} />
                                        Recibo
                                    </Button>
                                </div>
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
    );
}
