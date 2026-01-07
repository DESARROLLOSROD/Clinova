'use client'

import { useUser, Permission } from '@/contexts/UserContext'
import React from 'react'

interface CanProps {
  permission: Permission | Permission[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const { can } = useUser()

  const hasPermission = Array.isArray(permission)
    ? permission.some((p) => can(p))
    : can(permission)

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface CanAllProps {
    permissions: Permission[]
    fallback?: React.ReactNode
    children: React.ReactNode
}

export function CanAll({ permissions, fallback = null, children }: CanAllProps) {
    const { can } = useUser()

    const hasAllPermissions = permissions.every((p) => can(p))

    if (!hasAllPermissions) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
