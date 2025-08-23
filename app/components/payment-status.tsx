
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function PaymentStatus() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (success || canceled) {
      setShow(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShow(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, canceled])

  if (!show || (!success && !canceled)) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {success === 'true' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-green-800 mb-1">
                ¡Pago exitoso!
              </h3>
              <p className="text-sm text-green-700">
                Ya tienes acceso completo al curso. ¡Comienza a aprender!
              </p>
            </div>
          </div>
        </div>
      )}
      
      {canceled === 'true' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                Pago cancelado
              </h3>
              <p className="text-sm text-yellow-700">
                No se realizó el pago. Puedes intentarlo de nuevo cuando quieras.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setShow(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
  )
}
