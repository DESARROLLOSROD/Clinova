export interface WhatsAppMessage {
    to: string;
    body: string;
    templateId?: string;
    variables?: Record<string, string>;
}

export class WhatsAppService {
    private apiKey: string;
    private providerUrl: string;

    constructor() {
        this.apiKey = process.env.WHATSAPP_API_KEY || '';
        this.providerUrl = process.env.WHATSAPP_PROVIDER_URL || '';
    }

    /**
     * Sends a plain text message via WhatsApp
     */
    async sendMessage(payload: WhatsAppMessage): Promise<boolean> {
        if (!this.apiKey) {
            console.warn('WhatsApp API Key is missing. Message logged instead:', payload);
            return false;
        }

        try {
            // Placeholder: Replace with actual fetch to Twilio/Meta/Waha
            console.log(`[WhatsApp] Sending to ${payload.to}: ${payload.body}`);

            // Example fetch:
            // const response = await fetch(this.providerUrl, { ... });
            // return response.ok;

            return true;
        } catch (error) {
            console.error('Failed to send WhatsApp message:', error);
            return false;
        }
    }

    /**
     * Sends a template-based appointment reminder
     */
    async sendAppointmentReminder(patientPhone: string, patientName: string, appointmentTime: string) {
        return this.sendMessage({
            to: patientPhone,
            body: `Hola ${patientName}, recordatorio de tu cita en Clinova para el ${appointmentTime}.`,
            templateId: 'appointment_reminder', // Future use
            variables: { patientName, appointmentTime }
        });
    }
}

export const whatsappService = new WhatsAppService();
