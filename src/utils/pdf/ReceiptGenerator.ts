import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClinicData {
    name: string;
    logo_url?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    website?: string;
}

interface PaymentData {
    id: string;
    amount: number;
    method: string;
    status: string;
    payment_date: string;
    invoice_number?: string | null;
    patientName: string;
    patientDni?: string;
    concept: string;
    clinic?: ClinicData;
}

const getDataUri = (url: string): Promise<string> => {
    return new Promise((resolve) => {
        const image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');
        image.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            canvas.getContext('2d')?.drawImage(image, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = () => {
            resolve('');
        }
        image.src = url;
    });
}

export const generateReceipt = async (payment: PaymentData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const clinic = payment.clinic || { name: 'Clinova Fisioterapia' };

    // -- Logo --
    let logoOffset = 0;
    if (clinic.logo_url) {
        try {
            const base64Logo = await getDataUri(clinic.logo_url);
            if (base64Logo) {
                doc.addImage(base64Logo, 'PNG', 20, 15, 30, 30); // x, y, w, h
                logoOffset = 25; // Shift text a bit if necessary or just keep layout
            }
        } catch (e) {
            console.warn('Could not load logo', e);
        }
    }

    // -- Header --
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175); // Blue-800
    // Adjust X position if logo is present, or keep it consistent
    const textX = clinic.logo_url ? 60 : 20;

    doc.text(clinic.name, textX, 25);

    doc.setFontSize(10);
    doc.setTextColor(100);

    let currentY = 33;
    if (clinic.address) {
        doc.text(clinic.address, textX, currentY);
        currentY += 5;
    }
    if (clinic.city) {
        doc.text(clinic.city, textX, currentY);
        currentY += 5;
    }
    if (clinic.phone) {
        doc.text(`Tel: ${clinic.phone}`, textX, currentY);
        currentY += 5;
    }
    if (clinic.email) {
        doc.text(`Email: ${clinic.email}`, textX, currentY);
    }

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
    doc.line(20, 60, pageWidth - 20, 60);

    // -- Patient Info --
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos del Paciente:', 20, 75);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Nombre: ${payment.patientName}`, 20, 83);
    if (payment.patientDni) {
        doc.text(`DNI: ${payment.patientDni}`, 20, 90);
    }

    // -- Payment Details Box --
    const startY = 110;
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

    if (clinic.website) {
        doc.text(clinic.website, 20, startY + 85);
    } else {
        doc.text('Este documento sirve como justificante de pago.', 20, startY + 85);
    }

    // Save
    doc.save(`Recibo_${payment.patientName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
