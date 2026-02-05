import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sendWhatsApp } from '@/lib/twilio';

// Initialize Resend with API Key (should be in env vars)
// Lazy initialization inside handler to avoid build errors if env var is missing

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

        const apiKey = process.env.RESEND_API_KEY;
        /*
        if (!apiKey) {
             console.warn('RESEND_API_KEY is not defined');
             // In build time or if simply missing, we might want to fail gracefully or just log
             // For now, let's just avoid crashing if called.
             return NextResponse.json({ message: 'Email service not configured' }, { status: 503 });
        }
        */
        // Actually, let's just try/catch or simple check.
        // If we want to support build without env, we just need it to NOT be top level.
        // If it runs at runtime without key, it SHOULD fail or we handle it.

        const resend = new Resend(apiKey || 're_123'); // Fallback to dummy key to satisfy constructor if missing at runtime (though it will fail to send)
        // OR better: check content

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
            name,
            email,
            phone
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
                // Send Email with Dynamic Reply-To
                const replyTo = clinic?.email || 'soporte@clinova.app';
                const clinicPhone = clinic?.phone || '';

                const { data: emailData, error: emailError } = await resend.emails.send({
                    from: 'Clinova <noreply@resend.dev>',
                    to: patient.email,
                    replyTo: replyTo,
                    subject: `Recordatorio de Cita: ${date}`,
                    html: `
                    <h1>Hola, ${patientName}</h1>
                    <p>Te recordamos que tienes una cita en <strong>${clinicName}</strong> programada para:</p>
                    <p style="font-size: 1.2em; font-weight: bold;">${date}</p>
                    <p>Si necesitas reagendar, por favor contáctanos.</p>
                    <br/>
                    <p>Atentamente,<br/>Equipo ${clinicName}</p>
                    ${clinicPhone ? `<p>Tel: ${clinicPhone}</p>` : ''}
                    ${clinic.email ? `<p>Email: ${clinic.email}</p>` : ''}
                `
                });

                // Send WhatsApp (if phone exists)
                let whatsappResult = null;
                if (patient.phone) {
                    let phone = patient.phone.replace(/\D/g, '');
                    // Mexico logic: 10 digits -> +521...
                    if (phone.length === 10) {
                        phone = `521${phone}`;
                    } else if (phone.length === 12 && phone.startsWith('52') && phone[2] !== '1') {
                        // Handle case where 52 is present but 1 is missing
                        phone = `521${phone.substring(2)}`;
                    }

                    if (!phone.startsWith('+')) phone = `+${phone}`;

                    const whatsappBody = `Hola ${patientName}, recordatorio de tu cita en ${clinicName} el ${date}. ` +
                        (clinicPhone ? `Dudas al: ${clinicPhone}` : '');

                    whatsappResult = await sendWhatsApp(phone, whatsappBody);
                }

                if (emailData || whatsappResult?.success) {
                    // Mark as sent if at least one succeeded
                    await supabase
                        .from('appointments')
                        .update({ reminder_sent: true })
                        .eq('id', appt.id);

                    results.push({
                        id: appt.id,
                        status: 'sent',
                        email: emailData ? 'ok' : 'skip/fail',
                        whatsapp: whatsappResult ? (whatsappResult.success ? 'ok' : whatsappResult.error) : 'no-phone'
                    });
                } else {
                    console.error('All notifications failed');
                    results.push({ id: appt.id, status: 'failed', emailError, whatsappError: whatsappResult?.error });
                }
            } catch (err) {
                console.error('Exception processing notification:', err);
                results.push({ id: appt.id, status: 'failed', error: err });
            }
        }

        return NextResponse.json({ success: true, processed: results.length, details: results });
    } catch (err: any) {
        console.error('Cron error:', err);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
