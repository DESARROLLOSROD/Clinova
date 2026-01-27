'use server'

import { logActivity } from "@/lib/logger"
import { createClient } from "@/utils/supabase/server"

export async function logLoginAction() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            await logActivity({
                action: 'login',
                entityType: 'auth',
                entityId: user.id,
                details: { email: user.email }
            })
        }
    } catch (error) {
        console.error('Error in logLoginAction:', error)
    }
}
