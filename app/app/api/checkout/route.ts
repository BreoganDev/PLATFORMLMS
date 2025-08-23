
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { courseId } = await req.json()

    if (!courseId) {
      return NextResponse.json(
        { error: 'ID del curso es requerido' },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: courseId, isPublished: true },
      include: { instructor: true }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    if (course?.price === 0) {
      return NextResponse.json(
        { error: 'Este curso es gratuito' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session?.user?.id,
          courseId: courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Ya estás inscrito en este curso' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: course?.title,
              description: course?.description || undefined,
              images: course?.coverImage ? [course?.coverImage] : undefined,
            },
            unit_amount: Math.round(course?.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/course/${course?.slug}?canceled=true`,
      metadata: {
        courseId: course?.id,
        userId: session?.user?.id,
      },
    })

    // Create pending order
    await db.order.create({
      data: {
        userId: session?.user?.id,
        courseId: course?.id,
        totalAmount: course?.price,
        status: 'PENDING',
        stripeSessionId: stripeSession?.id,
      },
    })

    return NextResponse.json({ url: stripeSession?.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    )
  }
}
