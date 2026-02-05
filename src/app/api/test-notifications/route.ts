
import { NextResponse } from 'next/server';
import { sendWhatsApp } from '@/lib/twilio';
import { sendPushNotificationToUser } from '@/lib/push-notifications-server';
import { createAdminClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, phone, userId, message } = body;

        if (type === 'whatsapp') {
            if (!phone) return NextResponse.json({ error: 'Phone required for WhatsApp test' }, { status: 400 });

            console.log(`Testing WhatsApp to ${phone}...`);
            const result = await sendWhatsApp(phone, message || 'Test message from Clinova');

            return NextResponse.json({
                channel: 'whatsapp',
                success: result.success,
                details: result
            });
        }

        if (type === 'push') {
            if (!userId) return NextResponse.json({ error: 'UserId required for Push test' }, { status: 400 });

            console.log(`Testing Push to user ${userId}...`);

            // Check if user has tokens
            const supabase = createAdminClient();
            const { data: devices } = await supabase.from('user_devices').select('*').eq('user_id', userId);

            const result = await sendPushNotificationToUser(userId, 'Test Notification', message || 'This is a test push');

            return NextResponse.json({
                channel: 'push',
                success: result.success,
                deviceCount: devices?.length || 0,
                devices: devices, // Show them to debug
                details: result
            });
        }

        return NextResponse.json({ error: 'Invalid type. Use "whatsapp" or "push"' }, { status: 400 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
