import twilio from 'twilio';

// Lazy initialization to avoid build errors
let twilioClient: twilio.Twilio | null = null;

export const getTwilioClient = () => {
    if (!twilioClient) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (accountSid && authToken) {
            twilioClient = twilio(accountSid, authToken);
        } else {
            console.warn('Twilio credentials not configured');
        }
    }
    return twilioClient;
};

export const sendWhatsApp = async (to: string, body: string) => {
    const client = getTwilioClient();
    if (!client) return { success: false, error: 'Twilio not configured' };

    try {
        const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Sandbox default
        // Ensure 'to' number has whatsapp: prefix
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

        const message = await client.messages.create({
            body,
            from,
            to: formattedTo
        });
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        return { success: false, error };
    }
};
