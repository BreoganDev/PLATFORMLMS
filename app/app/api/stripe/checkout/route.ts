
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { courseId, courseName, price, currency = 'eur' } = body

    // Validate input
    if (!courseId || !courseName || typeof price !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate currency
    const supportedCurrencies = ['eur', 'usd']
    if (!supportedCurrencies.includes(currency.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unsupported currency' },
        { status: 400 }
      )
    }

    // Check if course exists and is published
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isPublished: true
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if user already purchased this course
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        status: 'completed'
      }
    })

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Course already purchased' },
        { status: 400 }
      )
    }

    // Get course slug for redirect URLs
    const courseSlug = course.slug

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: courseName,
              description: `Acceso completo al curso: ${courseName}`,
              images: course.coverImage ? [course.coverImage] : undefined,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/course/${courseSlug}?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/course/${courseSlug}?canceled=true`,
      customer_email: session.user.email || undefined,
      metadata: {
        courseId,
        userId: session.user.id,
        currency: currency.toLowerCase(),
      },
      locale: 'es',
      billing_address_collection: 'required',
    })

    // Create pending purchase record
    await prisma.purchase.create({
      data: {
        userId: session.user.id,
        courseId,
        stripeSessionId: checkoutSession.id,
        status: 'pending'
      }
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
