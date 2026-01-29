import { createClient } from '@/utils/supabase/server';
import { createFirebaseAdminApp } from '@/lib/firebase-admin';

interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

export async function sendPushNotification(userId: string, payload: PushNotificationPayload) {
    const supabase = await createClient();

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

        const tokens = devices.map(d => d.fcm_token);

        // 2. Initialize Firebase Admin
        const admin = createFirebaseAdminApp();

        // 3. Send via FCM V1 API
        const response = await admin.messaging().sendEachForMulticast({
            tokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data,
        });

        console.log(`FCM V1: Sent ${response.successCount} messages, failed ${response.failureCount}`);

        if (response.failureCount > 0) {
            console.error('Failed messages:', response.responses.filter(r => !r.success));
        }

        return {
            success: true,
            results: response.responses,
            successCount: response.successCount,
            failureCount: response.failureCount
        };

    } catch (error) {
        console.error('Error in sendPushNotification (V1):', error);
        return { success: false, error };
    }
}
