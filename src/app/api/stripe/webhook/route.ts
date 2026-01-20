import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, SUBSCRIPTION_STATUS_MAP } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Use service role for webhook operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
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
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoiceFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const clinicId = session.metadata?.clinic_id
  const plan = session.metadata?.plan

  if (!clinicId) {
    console.error('No clinic_id in session metadata')
    return
  }

  // Update clinic subscription info
  await supabaseAdmin.from('clinics').update({
    subscription_tier: plan || 'basic',
    subscription_status: 'active',
    stripe_subscription_id: session.subscription as string,
  }).eq('id', clinicId)

  console.log(`Checkout completed for clinic ${clinicId}`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const clinicId = subscription.metadata?.clinic_id

  if (!clinicId) {
    // Try to find clinic by customer ID
    const { data: clinic } = await supabaseAdmin
      .from('clinics')
      .select('id')
      .eq('stripe_customer_id', subscription.customer as string)
      .single()

    if (!clinic) {
      console.error('Could not find clinic for subscription')
      return
    }

    await updateClinicSubscription(clinic.id, subscription)
  } else {
    await updateClinicSubscription(clinicId, subscription)
  }
}

async function updateClinicSubscription(clinicId: string, subscription: Stripe.Subscription) {
  const status = SUBSCRIPTION_STATUS_MAP[subscription.status] || 'pending'
  const plan = subscription.metadata?.plan || 'basic'

  // Calculate next payment date
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

  await supabaseAdmin.from('clinics').update({
    subscription_status: status,
    subscription_tier: plan,
    stripe_subscription_id: subscription.id,
    next_payment_date: currentPeriodEnd.toISOString().split('T')[0],
  }).eq('id', clinicId)

  console.log(`Subscription updated for clinic ${clinicId}: ${status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data: clinic } = await supabaseAdmin
    .from('clinics')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!clinic) {
    console.error('Could not find clinic for deleted subscription')
    return
  }

  await supabaseAdmin.from('clinics').update({
    subscription_status: 'cancelled',
    stripe_subscription_id: null,
  }).eq('id', clinic.id)

  console.log(`Subscription cancelled for clinic ${clinic.id}`)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  const { data: clinic } = await supabaseAdmin
    .from('clinics')
    .select('id')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single()

  if (!clinic) return

  // Update next payment date
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
  const nextPaymentDate = new Date(subscription.current_period_end * 1000)

  await supabaseAdmin.from('clinics').update({
    subscription_status: 'active',
    next_payment_date: nextPaymentDate.toISOString().split('T')[0],
  }).eq('id', clinic.id)

  console.log(`Invoice paid for clinic ${clinic.id}`)
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  const { data: clinic } = await supabaseAdmin
    .from('clinics')
    .select('id')
    .eq('stripe_subscription_id', invoice.subscription as string)
    .single()

  if (!clinic) return

  await supabaseAdmin.from('clinics').update({
    subscription_status: 'suspended',
  }).eq('id', clinic.id)

  console.log(`Invoice failed for clinic ${clinic.id}`)
}
