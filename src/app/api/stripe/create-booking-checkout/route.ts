import { createClient } from '@/utils/supabase/server'
import { getStripeClient } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { appointmentId, redirectUrl } = await req.json()

        // Fetch appointment details
        const { data: appointment } = await supabase
            .from('appointments')
            // Join with clinic_services to get price if available, otherwise fallback
            .select('*, clinic_services(name, price)')
            .eq('id', appointmentId)
            .single()

        if (!appointment) {
            return new NextResponse('Appointment not found', { status: 404 })
        }

        const price = appointment.clinic_services?.price || 500; // Default or fetched price. Ensure this is handled correctly.
        // Ideally appointments should snapshot the price at booking time, but for now we look up service.

        // IMPORTANT: Verify the appointment belongs to the user (patient)
        const { data: patient } = await supabase
            .from('patients')
            .select('id')
            .eq('auth_user_id', user.id)
            .single()

        if (!patient || appointment.patient_id !== patient.id) {
            return new NextResponse('Unauthorized access to this appointment', { status: 403 })
        }

        const stripe = getStripeClient()

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'mxn',
                        product_data: {
                            name: `Consulta: ${appointment.clinic_services?.name || 'Fisioterapia'}`,
                            description: `Cita el ${new Date(appointment.start_time).toLocaleDateString()}`,
                        },
                        unit_amount: Math.round(price * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${redirectUrl}?payment_status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${redirectUrl}?payment_status=cancelled`,
            client_reference_id: appointmentId, // We use this in webhook to match back to appointment
            metadata: {
                appointmentId: appointmentId,
                patientId: patient.id,
                userId: user.id
            }
        })

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
