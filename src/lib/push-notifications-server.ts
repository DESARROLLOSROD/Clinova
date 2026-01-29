import { createClient } from '@/utils/supabase/server';

interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

export async function sendPushNotification(userId: string, payload: PushNotificationPayload) {
    const supabase = await createClient();
    const serverKey = process.env.FCM_SERVER_KEY;

    if (!serverKey) {
        console.error('FCM_SERVER_KEY is not configured');
        return { success: false, error: 'Configuration missing' };
    }

    try {
        // 1. Get user devices (FCM tokens)
        const { data: devices, error } = await supabase
            .from('user_devices')
            .select('fcm_token')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching user devices:', error);
            return { success: false, error: error.message };
        }

        if (!devices || devices.length === 0) {
            console.log('No devices found for user:', userId);
            return { success: true, message: 'No devices registered' };
        }

        // 2. Send notifications
        const tokens = devices.map(d => d.fcm_token);
        const results = [];

        // Legacy FCM API (Simple to implement without firebase-admin)
        // For production at scale, consider upgrading to HTTP v1 API with service account
        for (const token of tokens) {
            try {
                const response = await fetch('https://fcm.googleapis.com/fcm/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': `key=${serverKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: token,
                        notification: {
                            title: payload.title,
                            body: payload.body,
                            sound: 'default',
                            badge: 1
                        },
                        data: payload.data
                    }),
                });

                const data = await response.json();
                results.push({ token, success: response.ok, data });
            } catch (err) {
                console.error('Error sending to token:', token, err);
                results.push({ token, success: false, error: err });
            }
        }

        return { success: true, results };

    } catch (error) {
        console.error('Error in sendPushNotification:', error);
        return { success: false, error };
    }
}
