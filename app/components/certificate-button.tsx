
'use client'

import { useState } from 'react'
import { Award, Download, Loader, CheckCircle } from 'lucide-react'

interface CertificateButtonProps {
  courseId: string
  courseName: string
  completionPercentage: number
}

export default function CertificateButton({ 
  courseId, 
  courseName, 
  completionPercentage 
}: CertificateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canGenerateCertificate = completionPercentage >= 80

  const handleGenerateCertificate = async () => {
    if (!canGenerateCertificate) {
      setError(`Necesitas completar al menos el 80% del curso para obtener el certificado. Progreso actual: ${Math.round(completionPercentage)}%`)
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al generar certificado')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `certificado-${courseName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Certificate generation error:', error)
      setError(error instanceof Error ? error.message : 'Error al generar certificado')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Completion Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso del curso</span>
          <span className="text-sm font-bold text-gray-900">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              completionPercentage >= 80 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-600">
          {completionPercentage >= 80 ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              ¡Elegible para certificado!
            </div>
          ) : (
            `Necesitas ${80 - Math.round(completionPercentage)}% más para obtener el certificado`
          )}
        </div>
      </div>

      {/* Certificate Button */}
      <button
        onClick={handleGenerateCertificate}
        disabled={!canGenerateCertificate || isGenerating}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 ${
          canGenerateCertificate
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isGenerating ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            Generando Certificado...
          </>
        ) : (
          <>
            <Award className="h-5 w-5" />
            {canGenerateCertificate ? 'Descargar Certificado' : 'Certificado No Disponible'}
          </>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Certificate Info */}
      {canGenerateCertificate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">¡Felicitaciones!</p>
              <p>Has completado este curso y puedes descargar tu certificado oficial de finalización.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
