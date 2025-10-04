import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { grantAccess, revokeAccess } from '@/lib/kv-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
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
            await grantAccess(customerId, subscription.id);
            console.log(`✅ Access granted for customer ${customerId}`);
          }
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

        // Stripe invoices can have subscription but it's not in the TS types
        const invoiceWithSub = invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription }
        const subscriptionId = invoiceWithSub.subscription
          ? typeof invoiceWithSub.subscription === 'string'
            ? invoiceWithSub.subscription
            : invoiceWithSub.subscription.id
          : undefined

        if (customerId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          if (subscription.status === 'active') {
            await grantAccess(customerId, subscription.id);
            console.log(`✅ Renewal confirmed for customer ${customerId}`);
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId =
          typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

        // Stripe invoices can have subscription but it's not in the TS types
        const invoiceWithSub = invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription }
        const subscriptionId = invoiceWithSub.subscription
          ? typeof invoiceWithSub.subscription === 'string'
            ? invoiceWithSub.subscription
            : invoiceWithSub.subscription.id
          : undefined

        if (customerId && subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          if (subscription.status !== 'active') {
            await revokeAccess(customerId);
            console.log(`❌ Payment failed, access revoked for customer ${customerId}`);
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
            await grantAccess(customerId, subscription.id);
            console.log(`✅ Subscription updated, still active for ${customerId}`);
          } else {
            await revokeAccess(customerId);
            console.log(`❌ Subscription updated, revoked access for ${customerId}`);
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
          await revokeAccess(customerId);
          console.log(`❌ Access revoked for customer ${customerId}`);
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