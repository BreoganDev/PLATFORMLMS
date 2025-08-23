
import { NextResponse } from 'next/server'

export const dynamic = "force-dynamic";

// Simulated exchange rates (in a real app, you'd fetch from a service like exchangerate-api.com)
const EXCHANGE_RATES = {
  eur_to_usd: 1.08,
  usd_to_eur: 0.93,
} as const

export async function GET() {
  try {
    // In a real app, you'd fetch from an external API like:
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR')
    // const data = await response.json()
    // return NextResponse.json({ rate: data.rates.USD })
    
    return NextResponse.json({ 
      rates: EXCHANGE_RATES,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Exchange rate error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    )
  }
}
