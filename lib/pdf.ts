'use client'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function downloadInvoicePDF(elementId: string, filename?: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) throw new Error('Invoice element not found')

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth  = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth   = pageWidth
  const imgHeight  = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position   = 0

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename ?? 'invoice.pdf')
}

export function printInvoice(elementId: string) {
  const element = document.getElementById(elementId)
  if (!element) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', system-ui, sans-serif; background: white; color: #111; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
}
