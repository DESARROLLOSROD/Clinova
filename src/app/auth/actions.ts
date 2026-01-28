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
        return { success: true }
    } catch (error) {
        console.error('Error in logLoginAction:', error)
        return { success: false }
    }
}

export async function signOutAction() {
    try {
        const supabase = await createClient()
        // Check user before signing out for logging (optional)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            await logActivity({
                action: 'logout',
                entityType: 'auth',
                entityId: user.id,
                details: { email: user.email }
            })
        }

        await supabase.auth.signOut()
        return { success: true }
    } catch (error) {
        console.error('Error signing out:', error)
        return { success: false }
    }
}
