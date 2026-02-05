import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export interface PaymentExportColumns {
    date: string
    patient: string
    amount: number
    method: string
    status: string
    concept: string
}

export const exportToExcel = async (data: PaymentExportColumns[], filename: string) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pagos')

    worksheet.columns = [
        { header: 'Fecha', key: 'date', width: 20 },
        { header: 'Paciente', key: 'patient', width: 30 },
        { header: 'Concepto', key: 'concept', width: 30 },
        { header: 'Monto', key: 'amount', width: 15 },
        { header: 'Método', key: 'method', width: 15 },
        { header: 'Estado', key: 'status', width: 15 },
    ]

    data.forEach((item) => {
        worksheet.addRow(item)
    })

    // Style header row
    worksheet.getRow(1).font = { bold: true }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
}

export const exportToPdf = (data: PaymentExportColumns[], filename: string, title: string) => {
    const doc = new jsPDF()

    doc.text(title, 14, 20)
    doc.text(`Generado: ${format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}`, 14, 30)

    const tableData = data.map(item => [
        item.date,
        item.patient,
        item.concept,
        `$${item.amount.toFixed(2)}`,
        item.method,
        item.status
    ])

    autoTable(doc, {
        startY: 40,
        head: [['Fecha', 'Paciente', 'Concepto', 'Monto', 'Método', 'Estado']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    })

    doc.save(`${filename}.pdf`)
}
