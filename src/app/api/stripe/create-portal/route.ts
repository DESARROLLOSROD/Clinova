import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST() {
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
      .select('stripe_customer_id')
      .eq('id', profile.clinic_id)
      .single()

    if (!clinic?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No hay suscripción activa' },
        { status: 400 }
      )
    }

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: clinic.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/configuracion`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: 'Error al crear portal de facturación' },
      { status: 500 }
    )
  }
}
