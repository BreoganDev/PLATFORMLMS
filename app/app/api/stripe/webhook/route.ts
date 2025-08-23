
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const { courseId, userId } = session.metadata!

      // Update purchase status to completed
      await prisma.purchase.updateMany({
        where: {
          stripeSessionId: session.id,
          userId,
          courseId,
          status: 'pending'
        },
        data: {
          status: 'completed'
        }
      })

      // Create enrollment for the user
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        },
        update: {
          status: 'ACTIVE'
        },
        create: {
          userId,
          courseId,
          status: 'ACTIVE'
        }
      })

      console.log(`Purchase completed and enrollment created for user ${userId}, course ${courseId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
