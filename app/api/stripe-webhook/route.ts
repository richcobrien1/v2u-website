import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { randomUUID } from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

interface Env {
  'v2u-kv': KVNamespace
}

export async function POST(
  req: NextRequest,
  context: { env: Env }
) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const rawBody = await req.text()
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id

        if (customerId && session.subscription) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id

          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          if (subscription.status === 'active') {
            const secret = randomUUID()
            await Promise.all([
              context.env['v2u-kv'].put(`access:${customerId}`, 'granted'),
              context.env['v2u-kv'].put(`secret:${customerId}`, secret),
              context.env['v2u-kv'].put(`subscription:${customerId}`, subscription.id),
            ])
            console.log(`Access granted for customer ${customerId}`)
          }
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

        const subscriptionId = invoice.subscription
          ? typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription.id
          : undefined

        if (customerId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          if (subscription.status === 'active') {
            const secret = randomUUID()
            await Promise.all([
              context.env['v2u-kv'].put(`access:${customerId}`, 'granted'),
              context.env['v2u-kv'].put(`secret:${customerId}`, secret),
              context.env['v2u-kv'].put(`subscription:${customerId}`, subscription.id),
            ])
            console.log(`Renewal confirmed for customer ${customerId}`)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

        const subscriptionId = invoice.subscription
          ? typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription.id
          : undefined

        if (customerId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          if (subscription.status !== 'active') {
            await Promise.all([
              context.env['v2u-kv'].delete(`access:${customerId}`),
              context.env['v2u-kv'].delete(`secret:${customerId}`),
              context.env['v2u-kv'].delete(`subscription:${customerId}`),
            ])
            console.log(`Payment failed, access revoked for customer ${customerId}`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id

        if (customerId) {
          if (subscription.status === 'active') {
            const secret = randomUUID()
            await Promise.all([
              context.env['v2u-kv'].put(`access:${customerId}`, 'granted'),
              context.env['v2u-kv'].put(`secret:${customerId}`, secret),
              context.env['v2u-kv'].put(`subscription:${customerId}`, subscription.id),
            ])
            console.log(`Subscription updated, still active for ${customerId}`)
          } else {
            await Promise.all([
              context.env['v2u-kv'].delete(`access:${customerId}`),
              context.env['v2u-kv'].delete(`secret:${customerId}`),
              context.env['v2u-kv'].delete(`subscription:${customerId}`),
            ])
            console.log(`Subscription updated, revoked access for ${customerId}`)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id

        if (customerId) {
          await Promise.all([
            context.env['v2u-kv'].delete(`access:${customerId}`),
            context.env['v2u-kv'].delete(`secret:${customerId}`),
            context.env['v2u-kv'].delete(`subscription:${customerId}`),
          ])
          console.log(`Access revoked for customer ${customerId}`)
        }
        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id

        if (customerId) {
          console.log(`Trial ending soon for customer ${customerId}`)
          // Optional: trigger notification/email here
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler failed:', err)
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 })
  }
}