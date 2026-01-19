import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PaymentData {
    id: string;
    amount: number;
    method: string;
    status: string;
    payment_date: string;
    invoice_number?: string | null;
    patientName: string;
    patientDni?: string; // Optional if you have it
    concept: string;
}

export const generateReceipt = (payment: PaymentData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // -- Header --
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // Blue-800
    doc.text('Clinova Fisioterapia', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Calle Ejemplo 123, Ciudad', 20, 28);
    doc.text('Tel: +34 600 000 000', 20, 33);
    doc.text('Email: info@clinova.com', 20, 38);

    // -- Title --
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('RECIBO DE PAGO', pageWidth - 20, 30, { align: 'right' });

    doc.setFontSize(10);
    doc.text(`Fecha: ${format(new Date(payment.payment_date), 'dd MMMM yyyy', { locale: es })}`, pageWidth - 20, 38, { align: 'right' });
    if (payment.invoice_number) {
        doc.text(`Nº Factura: ${payment.invoice_number}`, pageWidth - 20, 43, { align: 'right' });
    }

    // -- Line --
    doc.setDrawColor(200);
    doc.line(20, 50, pageWidth - 20, 50);

    // -- Patient Info --
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos del Paciente:', 20, 65);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Nombre: ${payment.patientName}`, 20, 73);
    if (payment.patientDni) {
        doc.text(`DNI: ${payment.patientDni}`, 20, 80);
    }

    // -- Payment Details Box --
    const startY = 100;
    doc.setFillColor(249, 250, 251); // Gray-50
    doc.rect(20, startY, pageWidth - 40, 40, 'F');

    doc.setFont('helvetica', 'bold');
    doc.text('Concepto', 30, startY + 15);
    doc.text('Importe', pageWidth - 50, startY + 15, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.text(payment.concept, 30, startY + 28);
    doc.text(`${payment.amount.toFixed(2)} €`, pageWidth - 50, startY + 28, { align: 'right' });

    // -- Total --
    doc.line(20, startY + 40, pageWidth - 20, startY + 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('TOTAL PAGADO', pageWidth - 90, startY + 55, { align: 'right' });
    doc.setTextColor(30, 64, 175);
    doc.text(`${payment.amount.toFixed(2)} €`, pageWidth - 50, startY + 55, { align: 'right' });

    // -- Footer --
    doc.setTextColor(150);
    doc.setFontSize(9);
    doc.text('Gracias por su confianza.', 20, startY + 80);
    doc.text('Este documento sirve como justificante de pago.', 20, startY + 85);

    // Save
    doc.save(`Recibo_${payment.patientName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
