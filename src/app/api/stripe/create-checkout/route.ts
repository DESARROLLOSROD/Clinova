import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { stripe, getPriceId, SubscriptionPlan, BillingInterval } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user profile to find clinic
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('clinic_id, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'clinic_manager') {
      return NextResponse.json(
        { error: 'Solo el administrador de la clínica puede gestionar suscripciones' },
        { status: 403 }
      )
    }

    // Get clinic info
    const { data: clinic } = await supabase
      .from('clinics')
      .select('id, name, stripe_customer_id')
      .eq('id', profile.clinic_id)
      .single()

    if (!clinic) {
      return NextResponse.json({ error: 'Clínica no encontrada' }, { status: 404 })
    }

    const { plan, interval } = (await request.json()) as {
      plan: SubscriptionPlan
      interval: BillingInterval
    }

    // Get or create Stripe customer
    let customerId = clinic.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: clinic.name,
        metadata: {
          clinic_id: clinic.id,
          user_id: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to clinic
      await supabase
        .from('clinics')
        .update({ stripe_customer_id: customerId })
        .eq('id', clinic.id)
    }

    // Get price ID for the selected plan
    const priceId = getPriceId(plan, interval)

    if (!priceId) {
      return NextResponse.json(
        { error: 'Plan no configurado correctamente' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/configuracion?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/configuracion?subscription=cancelled`,
      metadata: {
        clinic_id: clinic.id,
        plan,
        interval,
      },
      subscription_data: {
        metadata: {
          clinic_id: clinic.id,
          plan,
        },
        trial_period_days: 30, // 30-day trial
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Error al crear sesión de pago' },
      { status: 500 }
    )
  }
}
