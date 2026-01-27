'use server'

import { aiService } from "@/lib/services/ai"

export async function generateSessionSummaryAction(notes: string) {
    if (!notes || notes.trim().length === 0) {
        return { success: false, error: 'Notes are empty' }
    }

    try {
        const summary = await aiService.generateClinicalSummary(notes)
        return { success: true, data: summary }
    } catch (error) {
        console.error('Error generating summary:', error)
        return { success: false, error: 'Failed to generate summary' }
    }
}
