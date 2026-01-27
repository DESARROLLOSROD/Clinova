import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function logActivity({
    action,
    entityType,
    entityId,
    details,
    clinicId
}: {
    action: string
    entityType?: string
    entityId?: string
    details?: any
    clinicId?: string
}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        // Try to get IP and User Agent
        const headersList = await headers()
        const ip = headersList.get('x-forwarded-for') || 'unknown'
        const userAgent = headersList.get('user-agent') || 'unknown'

        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details,
            clinic_id: clinicId,
            ip_address: ip,
            user_agent: userAgent
        })
    } catch (error) {
        console.error('Failed to log activity:', error)
        // Don't block the main flow if logging fails
    }
}
