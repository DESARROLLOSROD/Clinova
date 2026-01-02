'use client';

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  payment_date: string;
  invoice_number: string | null;
  description: string | null;
  patients: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

interface InvoiceGeneratorProps {
  payment: Payment;
}

export function InvoiceGenerator({ payment }: InvoiceGeneratorProps) {
  const generateInvoice = () => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) return;

    const methodLabels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      insurance: 'Seguro',
    };

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura - ${payment.invoice_number || payment.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 32px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .invoice-info div {
              flex: 1;
            }
            .invoice-info h3 {
              color: #2563eb;
              margin-top: 0;
              font-size: 14px;
              text-transform: uppercase;
            }
            .invoice-info p {
              margin: 5px 0;
              line-height: 1.6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f3f4f6;
              padding: 12px;
              text-align: left;
              border-bottom: 2px solid #2563eb;
              font-weight: 600;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            .total-row {
              font-size: 18px;
              font-weight: bold;
              background-color: #f9fafb;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .print-button {
              background-color: #2563eb;
              color: white;
              padding: 10px 20px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              margin-bottom: 20px;
            }
            .print-button:hover {
              background-color: #1d4ed8;
            }
            @media print {
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">Imprimir Factura</button>

          <div class="header">
            <h1>CLINOVA</h1>
            <p>Clínica de Fisioterapia</p>
            <p>Factura de Pago</p>
          </div>

          <div class="invoice-info">
            <div>
              <h3>Factura Para:</h3>
              <p><strong>${payment.patients.first_name} ${payment.patients.last_name}</strong></p>
              <p>${payment.patients.email}</p>
              <p>${payment.patients.phone}</p>
            </div>
            <div style="text-align: right;">
              <h3>Detalles de Factura:</h3>
              <p><strong>Número:</strong> ${payment.invoice_number || payment.id.slice(0, 8).toUpperCase()}</p>
              <p><strong>Fecha:</strong> ${new Date(payment.payment_date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <p><strong>Estado:</strong> ${payment.status === 'completed' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : payment.status}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Método de Pago</th>
                <th style="text-align: right;">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${payment.description || 'Pago de servicios de fisioterapia'}</td>
                <td>${methodLabels[payment.method]}</td>
                <td style="text-align: right;">$${payment.amount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="2" style="text-align: right;">TOTAL:</td>
                <td style="text-align: right;">$${payment.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Gracias por su confianza en CLINOVA</p>
            <p>Esta es una factura generada electrónicamente</p>
          </div>
        </body>
      </html>
    `;

    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
  };

  return (
    <button
      onClick={generateInvoice}
      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Ver Factura
    </button>
  );
}
