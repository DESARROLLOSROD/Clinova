'use client'

import { useUser, Permission } from '@/contexts/UserContext'
import React from 'react'

interface CanProps {
  permission: Permission | Permission[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const { can, loading, profile } = useUser()

  // If we have a profile (from server or client), use it to check permissions
  // This allows SSR-provided profiles to work immediately
  if (profile) {
    const hasPermission = Array.isArray(permission)
      ? permission.some((p) => can(p))
      : can(permission)

    if (!hasPermission) {
      return <>{fallback}</>
    }

    return <>{children}</>
  }

  // While loading and no profile yet, show nothing (prevents flash)
  if (loading) {
    return null
  }

  // No profile after loading completes - show fallback
  return <>{fallback}</>
}

interface CanAllProps {
    permissions: Permission[]
    fallback?: React.ReactNode
    children: React.ReactNode
}

export function CanAll({ permissions, fallback = null, children }: CanAllProps) {
    const { can, loading, profile } = useUser()

    // If we have a profile, check permissions
    if (profile) {
        const hasAllPermissions = permissions.every((p) => can(p))

        if (!hasAllPermissions) {
            return <>{fallback}</>
        }

        return <>{children}</>
    }

    // While loading and no profile yet, show nothing
    if (loading) {
        return null
    }

    // No profile after loading completes - show fallback
    return <>{fallback}</>
}
