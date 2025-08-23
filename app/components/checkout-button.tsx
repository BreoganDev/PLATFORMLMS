
'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Loader, Euro, DollarSign } from 'lucide-react'

interface CheckoutButtonProps {
  courseId: string
  courseName: string
  price: number
}

// Exchange rate for EUR to USD (in a real app, this would be fetched from an API)
const EUR_TO_USD_RATE = 1.08

export default function CheckoutButton({ courseId, courseName, price }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'eur' | 'usd'>('eur')
  const [showCurrencySelector, setShowCurrencySelector] = useState(false)

  const getPrice = (currency: 'eur' | 'usd') => {
    if (currency === 'eur') {
      return price
    } else {
      return Math.round(price * EUR_TO_USD_RATE * 100) / 100
    }
  }

  const formatPrice = (amount: number, currency: 'eur' | 'usd') => {
    const formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase(),
    })
    return formatter.format(amount)
  }

  const handleCheckout = async (currency: 'eur' | 'usd') => {
    setIsLoading(true)

    try {
      const finalPrice = getPrice(currency)
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          courseName,
          price: finalPrice,
          currency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pago')
      }

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error al procesar el pago. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (showCurrencySelector) {
    return (
      <div className="w-full space-y-3">
        <div className="text-sm text-gray-600 text-center mb-3">
          Elige tu divisa preferida:
        </div>
        
        {/* EUR Option */}
        <button
          onClick={() => handleCheckout('eur')}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {isLoading && selectedCurrency === 'eur' ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Euro className="h-5 w-5" />
              Pagar {formatPrice(getPrice('eur'), 'eur')}
            </>
          )}
        </button>

        {/* USD Option */}
        <button
          onClick={() => handleCheckout('usd')}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {isLoading && selectedCurrency === 'usd' ? (
            <>
              <Loader className="h-5 w-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <DollarSign className="h-5 w-5" />
              Pagar {formatPrice(getPrice('usd'), 'usd')}
            </>
          )}
        </button>

        {/* Back Button */}
        <button
          onClick={() => setShowCurrencySelector(false)}
          className="w-full text-gray-600 hover:text-gray-800 py-2 text-sm transition-colors"
        >
          ← Volver
        </button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      {/* Price Display */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {formatPrice(getPrice('eur'), 'eur')}
        </div>
        <div className="text-sm text-gray-600">
          o {formatPrice(getPrice('usd'), 'usd')}
        </div>
      </div>

      {/* Main Checkout Button */}
      <button
        onClick={() => setShowCurrencySelector(true)}
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-lg font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
      >
        <CreditCard className="h-6 w-6" />
        Comprar Ahora
      </button>

      {/* Quick EUR Button */}
      <button
        onClick={() => handleCheckout('eur')}
        disabled={isLoading}
        className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 text-sm"
      >
        {isLoading ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <Euro className="h-4 w-4" />
            Pago rápido en Euros
          </>
        )}
      </button>
    </div>
  )
}
