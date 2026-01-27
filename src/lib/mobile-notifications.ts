
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

/**
 * Initializes Push Notifications for the current device.
 * - Checks if running on a native platform (Android/iOS).
 * - Requests permission from the user.
 * - Registers listeners for token generation and notification receipt.
 */
export async function initPushNotifications(userId: string) {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {
        console.log('Push Notifications are only supported on native devices.');
        return;
    }

    try {
        const permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            const newPermStatus = await PushNotifications.requestPermissions();
            if (newPermStatus.receive !== 'granted') {
                console.log('Push Notification permission denied');
                return;
            }
        }

        if (permStatus.receive !== 'granted' && permStatus.receive !== 'prompt') {
            // Already denied
            return;
        }

        // Register for push notifications
        await PushNotifications.register();

        // Listeners
        addListeners(userId);

    } catch (error) {
        console.error('Error initializing push notifications:', error);
    }
}

function addListeners(userId: string) {
    // 1. Registration Success: We get the FCM Login
    PushNotifications.addListener('registration', async (token) => {
        console.log('Push Registration Token:', token.value);
        await registerDeviceToken(userId, token.value);
    });

    // 2. Registration Error
    PushNotifications.addListener('registrationError', (error) => {
        console.error('Push Registration Error:', error);
    });

    // 3. Notification Received (Foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push Notification Received:', notification);
        toast.info(notification.title || 'Nueva Notificación', {
            description: notification.body,
            duration: 5000,
        });
    });

    // 4. Notification Action Performed (Tapped)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push Action Performed:', notification.actionId, notification.inputValue);
        // You can add navigation logic here via a global navigator or event bus
    });
}

/**
 * Saves the FCM token to the Supabase database for the current user.
 */
async function registerDeviceToken(userId: string, token: string) {
    const supabase = createClient();
    const platform = Capacitor.getPlatform(); // 'android' or 'ios'

    try {
        const { error } = await supabase
            .from('user_devices')
            .upsert(
                {
                    user_id: userId,
                    fcm_token: token,
                    platform: platform,
                    last_active: new Date().toISOString()
                },
                { onConflict: 'user_id, fcm_token' }
            );

        if (error) {
            console.error('Error saving device token to Supabase:', error);
        } else {
            console.log('Device token saved successfully.');
        }
    } catch (err) {
        console.error('Unexpected error saving device token:', err);
    }
}
