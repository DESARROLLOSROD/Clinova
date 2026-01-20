'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

interface UseInactivityLogoutOptions {
    timeoutMinutes?: number // Default: 10 minutes
    warningMinutes?: number // Show warning before logout (default: 1 minute before)
}

export function useInactivityLogout(options: UseInactivityLogoutOptions = {}) {
    const { timeoutMinutes = 10, warningMinutes = 1 } = options
    const router = useRouter()
    const timeoutRef = useRef<NodeJS.Timeout>()
    const warningTimeoutRef = useRef<NodeJS.Timeout>()
    const warningShownRef = useRef(false)

    const TIMEOUT_MS = timeoutMinutes * 60 * 1000
    const WARNING_MS = (timeoutMinutes - warningMinutes) * 60 * 1000

    const logout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        toast.error('Sesión cerrada por inactividad', {
            description: 'Tu sesión ha sido cerrada por seguridad debido a inactividad.'
        })
        router.push('/login')
    }

    const showWarning = () => {
        if (!warningShownRef.current) {
            warningShownRef.current = true
            toast.warning('Sesión por expirar', {
                description: `Tu sesión se cerrará en ${warningMinutes} minuto${warningMinutes > 1 ? 's' : ''} por inactividad. Mueve el mouse para continuar.`,
                duration: 5000,
            })
        }
    }

    const resetTimer = () => {
        // Clear existing timers
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current)
        }

        // Reset warning flag
        warningShownRef.current = false

        // Set warning timer
        warningTimeoutRef.current = setTimeout(() => {
            showWarning()
        }, WARNING_MS)

        // Set logout timer
        timeoutRef.current = setTimeout(() => {
            logout()
        }, TIMEOUT_MS)
    }

    useEffect(() => {
        // Events that indicate user activity
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
        ]

        // Reset timer on any activity
        events.forEach((event) => {
            document.addEventListener(event, resetTimer)
        })

        // Initialize timer
        resetTimer()

        // Cleanup
        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, resetTimer)
            })
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeoutMinutes, warningMinutes])

    return { resetTimer }
}
