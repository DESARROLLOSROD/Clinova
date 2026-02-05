import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export interface ExportColumn {
    header: string
    key: string
    width?: number
}

export const exportToExcel = async (data: any[], columns: ExportColumn[], filename: string) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Datos')

    worksheet.columns = columns.map(col => ({
        header: col.header,
        key: col.key,
        width: col.width || 20
    }))

    // Add rows
    // ExcelJS adds rows by matching keys if we pass objects, which is what we have
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

export const exportToPdf = (data: any[], columns: ExportColumn[], filename: string, title: string) => {
    const doc = new jsPDF()

    doc.text(title, 14, 20)
    doc.text(`Generado: ${format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}`, 14, 30)

    // Prepare table data dynamically based on columns
    const headers = columns.map(col => col.header)
    const tableData = data.map(item =>
        columns.map(col => {
            // Check if there's a specific format needed? 
            // For now assume data is already formatted strings/numbers as prepared in page.tsx
            // except for the currency formatting which was hardcoded before.
            // page.tsx prepares 'amount' as a number. 
            // The previous implementation formatted it as `$${item.amount.toFixed(2)}`.
            // We should ideally pass formatted data or handle formatting here.
            // Given prepareExportData in page.tsx returns raw numbers for amount, 
            // we might lose the '$' prefix unless we check the key or type.
            // Let's stick to raw values for genericness OR update page.tsx to format it.
            // But wait, page.tsx prepareExportData returns:
            // amount: p.amount (number)
            // So to keep previous behavior we need to format it.
            // But a generic utils shouldn't predict formatting. 
            // Best practice: The Caller (page.tsx) should format the data for display/export.
            return item[col.key]
        })
    )

    autoTable(doc, {
        startY: 40,
        head: [headers],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    })

    doc.save(`${filename}.pdf`)
}
