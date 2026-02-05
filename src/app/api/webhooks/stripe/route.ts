import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/utils/supabase/server'
import Stripe from 'stripe'
import { sendPushNotificationToUser } from '@/lib/push-notifications-server';

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get('Stripe-Signature') as string

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('Missing STRIPE_WEBHOOK_SECRET');
        return new NextResponse('Webhook error: Missing Secret', { status: 500 });
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error: any) {
        console.error('Webhook signature verification failed.', error.message)
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const supabase = await createClient()

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const appointmentId = session.metadata?.appointmentId

        if (appointmentId) {
            // Update appointment status to paid
            const { error } = await supabase
                .from('appointments')
                .update({
                    payment_status: 'paid',
                    stripe_session_id: session.id
                })
                .eq('id', appointmentId)

            if (error) {
                console.error('Error updating appointment:', error)
                return new NextResponse('Database Error', { status: 500 })
            }

            // Fetch appointment details to notify therapist
            const { data: appointment } = await supabase
                .from('appointments')
                .select('therapist_id, start_time')
                .eq('id', appointmentId)
                .single();

            if (appointment?.therapist_id) {
                await sendPushNotificationToUser(
                    appointment.therapist_id,
                    'Pago Recibido',
                    `Se ha confirmado el pago para la cita del ${new Date(appointment.start_time).toLocaleDateString()}.`
                );
            }

            // Optional: Insert into payments table if you have the schema
            // await supabase.from('payments').insert({ ... })
        }
    }

    return new NextResponse('Received', { status: 200 })
}
