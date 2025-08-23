
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = headers().get('Stripe-Signature') as string

    let event
    
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    if (event?.type === 'checkout.session.completed') {
      const session = event?.data?.object

      const courseId = session?.metadata?.courseId
      const userId = session?.metadata?.userId
      const stripeSessionId = session?.id

      if (!courseId || !userId) {
        console.error('Missing courseId or userId in webhook metadata')
        return NextResponse.json(
          { error: 'Missing metadata' },
          { status: 400 }
        )
      }

      // Update order status
      const order = await db.order.findUnique({
        where: { stripeSessionId },
      })

      if (!order) {
        console.error('Order not found for session:', stripeSessionId)
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }

      await db.order.update({
        where: { id: order?.id },
        data: { status: 'PAID' },
      })

      // Create enrollment
      await db.enrollment.create({
        data: {
          userId,
          courseId,
          status: 'ACTIVE',
          orderId: order?.id,
        },
      })

      console.log(`Enrollment created for user ${userId} in course ${courseId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 500 }
    )
  }
}
