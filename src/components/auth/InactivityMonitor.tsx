'use client'

import { useInactivityLogout } from '@/hooks/useInactivityLogout'

export function InactivityMonitor() {
    // Configure timeout: 10 minutes with 1 minute warning
    // Change timeoutMinutes to 5 for 5-minute timeout
    useInactivityLogout({
        timeoutMinutes: 10,
        warningMinutes: 1
    })

    return null // This component doesn't render anything
}
