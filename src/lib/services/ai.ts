export interface AICompletionRequest {
    prompt: string;
    systemMessage?: string;
    temperature?: number;
}

export class AIService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.AI_API_KEY || '';
        // Defaults to OpenAI, can be changed to DeepSeek or LocalLLM URL
        this.baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    }

    /**
     * Generates a clinical summary or improvement based on input text.
     */
    async generateClinicalSummary(notes: string): Promise<string> {
        if (!this.apiKey) {
            console.warn('AI API Key is missing. Returning mock response.');
            return this.getMockResponse(notes);
        }

        try {
            // Placeholder: Replace with actual fetch to OpenAI/DeepSeek compatible API
            /*
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4-turbo', // or deepseek-chat
                    messages: [
                        { role: 'system', content: 'Eres un asistente clínico experto. Resume y mejora la redacción de estas notas de fisioterapia usando terminología médica precisa (SOAP).' },
                        { role: 'user', content: notes }
                    ],
                    temperature: 0.3
                })
            });
            const data = await response.json();
            return data.choices[0].message.content;
            */

            // Simulating network delay for now
            await new Promise(resolve => setTimeout(resolve, 1500));
            return this.getMockResponse(notes);

        } catch (error) {
            console.error('Failed to generate AI summary:', error);
            throw new Error('Error al conectar con el servicio de IA');
        }
    }

    private getMockResponse(notes: string): string {
        return `[RESUMEN GENERADO POR IA (MOCK)]\n\nPacientes refiere: "${notes}"\n\nObservaciones: El paciente muestra adherencia al tratamiento. Se sugiere continuar con el plan establecido.\n\n(Nota: Configura AI_API_KEY para obtener respuestas reales).`;
    }
}

export const aiService = new AIService();
