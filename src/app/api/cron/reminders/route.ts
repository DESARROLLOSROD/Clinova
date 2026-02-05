import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API Key (should be in env vars)
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
    try {
        // 1. Verify cron secret (optional but recommended for security)
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow bypassing for dev/demo purposes if secret not set, or return 401
            if (process.env.NODE_ENV === 'production') {
                return new NextResponse('Unauthorized', { status: 401 });
            }
        }

        const supabase = await createClient();

        // 2. Calculate time range: appointments starting in 24h (e.g. between 23h and 25h from now)
        // Or simpler: appointments tomorrow that haven't had reminder sent.

        const now = new Date();
        const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000); // 22h from now
        const tomorrowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000);   // 26h from now

        // Fetch appointments
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select(`
        id,
        start_time,
        patients (
          first_name,
          last_name,
          email,
          phone
        ),
        clinics (
            name
        )
      `)
            .eq('reminder_sent', false)
            .gte('start_time', tomorrowStart.toISOString())
            .lte('start_time', tomorrowEnd.toISOString())
            .not('patients', 'is', null);

        if (error) throw error;

        if (!appointments || appointments.length === 0) {
            return NextResponse.json({ message: 'No appointments to remind' });
        }

        const results = [];

        // 3. Send emails
        for (const appt of appointments) {
            // Supabase join hints sometimes return arrays. Cast to unknown then any to avoid fighting type system for this script.
            // In a strictly typed setup we'd use Database definitions.
            const patient = Array.isArray(appt.patients) ? appt.patients[0] : appt.patients as any;
            const clinic = Array.isArray(appt.clinics) ? appt.clinics[0] : appt.clinics as any;

            if (!patient?.email) continue;

            const patientName = `${patient.first_name} ${patient.last_name}`;
            const clinicName = clinic?.name || 'Clínica';
            const date = new Date(appt.start_time).toLocaleString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            try {
                const { data, error } = await resend.emails.send({
                    from: 'Clinova <noreply@resend.dev>', // Update with verify domain in prod
                    to: patient.email,
                    subject: `Recordatorio de Cita: ${date}`,
                    html: `
                    <h1>Hola, ${patientName}</h1>
                    <p>Te recordamos que tienes una cita en <strong>${clinicName}</strong> programada para:</p>
                    <p style="font-size: 1.2em; font-weight: bold;">${date}</p>
                    <p>Si necesitas reagendar, por favor contáctanos.</p>
                    <br/>
                    <p>Atentamente,<br/>Equipo ${clinicName}</p>
                `
                });

                if (data) {
                    // Mark as sent
                    await supabase
                        .from('appointments')
                        .update({ reminder_sent: true })
                        .eq('id', appt.id);

                    results.push({ id: appt.id, status: 'sent', email: patient.email });
                } else {
                    console.error('Error sending email:', error);
                    results.push({ id: appt.id, status: 'failed', error });
                }
            } catch (emailErr) {
                console.error('Exception sending email:', emailErr);
                results.push({ id: appt.id, status: 'failed', error: emailErr });
            }
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });
    } catch (err: any) {
        console.error('Cron error:', err);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
