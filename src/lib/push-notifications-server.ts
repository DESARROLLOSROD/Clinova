import { firebaseAdmin } from './firebase-admin';
import { createClient } from '@/utils/supabase/server';

/**
 * Sends a push notification to a specific user via their registered FCM token.
 */
export async function sendPushNotificationToUser(userId: string, title: string, body: string, data?: any) {
    try {
        const supabase = await createClient();

        // 1. Get user's FCM token from Supabase
        const { data: userDevice, error } = await supabase
            .from('user_devices')
            .select('fcm_token')
            .eq('user_id', userId)
            .order('last_active', { ascending: false })
            .limit(1)
            .single();

        if (error || !userDevice?.fcm_token) {
            console.log(`No active device token found for user ${userId}`);
            return { success: false, error: 'No token found' };
        }

        // 2. Send notification via Firebase Admin
        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            token: userDevice.fcm_token,
        };

        const response = await firebaseAdmin.messaging().send(message);
        console.log('Successfully sent push notification:', response);
        return { success: true, messageId: response };

    } catch (error) {
        console.error('Error sending push notification:', error);
        return { success: false, error };
    }
}
