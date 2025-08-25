
import jsPDF from 'jspdf'

export interface CertificateData {
  studentName: string
  courseName: string
  instructorName: string
  completionDate: Date
  certificateNumber: string
  validationHash: string
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Background color
  doc.setFillColor(248, 250, 252) // Light blue background
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Border
  doc.setDrawColor(59, 130, 246) // Blue border
  doc.setLineWidth(3)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

  // Inner decorative border
  doc.setDrawColor(147, 197, 253) // Light blue border
  doc.setLineWidth(1)
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(32)
  doc.setTextColor(30, 58, 138) // Dark blue
  const titleText = 'CERTIFICADO DE FINALIZACIÓN'
  const titleWidth = doc.getTextWidth(titleText)
  doc.text(titleText, (pageWidth - titleWidth) / 2, 50)

  // Subtitle
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(16)
  doc.setTextColor(75, 85, 99) // Gray
  const subtitleText = 'Este certificado acredita que'
  const subtitleWidth = doc.getTextWidth(subtitleText)
  doc.text(subtitleText, (pageWidth - subtitleWidth) / 2, 70)

  // Student name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(17, 24, 39) // Dark gray
  const nameWidth = doc.getTextWidth(data.studentName)
  doc.text(data.studentName, (pageWidth - nameWidth) / 2, 90)

  // Course completion text
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(16)
  doc.setTextColor(75, 85, 99) // Gray
  const completionText = 'ha completado exitosamente el curso'
  const completionWidth = doc.getTextWidth(completionText)
  doc.text(completionText, (pageWidth - completionWidth) / 2, 110)

  // Course name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(59, 130, 246) // Blue
  const courseNameWidth = doc.getTextWidth(data.courseName)
  doc.text(data.courseName, (pageWidth - courseNameWidth) / 2, 130)

  // Date and details
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(107, 114, 128) // Medium gray
  
  const completionDate = data.completionDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const dateText = `Completado el ${completionDate}`
  const dateWidth = doc.getTextWidth(dateText)
  doc.text(dateText, (pageWidth - dateWidth) / 2, 155)

  // Instructor signature area
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(17, 24, 39) // Dark gray
  const instructorText = `Instructor: ${data.instructorName}`
  doc.text(instructorText, 50, 180)

  // Certificate details
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(156, 163, 175) // Light gray
  
  doc.text(`Certificado N°: ${data.certificateNumber}`, 50, 195)
  doc.text(`Validación: ${data.validationHash.substring(0, 20)}...`, 50, 205)
  doc.text('LMS Basic - Sistema de Gestión de Aprendizaje', 50, 215)

  // QR Code placeholder text (in a real app, you'd generate a QR code)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Verificar en:', pageWidth - 80, 195)
  doc.text('lms-basic.com/validate', pageWidth - 80, 205)

  // Convert to buffer
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}
