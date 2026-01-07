'use client';

/**
 * Role Context Provider
 * Provides role and permission information to React components
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { UserRole, Permission, ROLE_PERMISSIONS, UserWithRole } from '@/types/roles';

interface RoleContextType {
  user: User | null;
  userRole: UserRole | null;
  permissions: Permission[];
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isAdmin: boolean;
  isTherapist: boolean;
  isReceptionist: boolean;
  isPatient: boolean;
  isStaff: boolean;
  refreshRole: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const getUserRoleFromUser = (user: User | null): UserRole | null => {
    if (!user) return null;

    // Check user_metadata first
    const metadataRole = user.user_metadata?.role as UserRole;
    if (metadataRole && Object.values(UserRole).includes(metadataRole)) {
      return metadataRole;
    }

    // Check app_metadata as fallback
    const appMetadataRole = user.app_metadata?.role as UserRole;
    if (appMetadataRole && Object.values(UserRole).includes(appMetadataRole)) {
      return appMetadataRole;
    }

    return null;
  };

  const loadUserRole = async () => {
    try {
      setIsLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      setUser(currentUser);

      if (currentUser) {
        const role = getUserRoleFromUser(currentUser);
        setUserRole(role);

        if (role) {
          setPermissions(ROLE_PERMISSIONS[role] || []);
        } else {
          setPermissions([]);
        }
      } else {
        setUserRole(null);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
      setUser(null);
      setUserRole(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserRole();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const role = getUserRoleFromUser(session.user);
        setUserRole(role);
        if (role) {
          setPermissions(ROLE_PERMISSIONS[role] || []);
        } else {
          setPermissions([]);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setPermissions([]);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const hasRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return userRole ? roles.includes(userRole) : false;
  };

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    return perms.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (perms: Permission[]): boolean => {
    return perms.every(permission => permissions.includes(permission));
  };

  const refreshRole = async () => {
    await loadUserRole();
  };

  const value: RoleContextType = {
    user,
    userRole,
    permissions,
    isLoading,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: userRole === UserRole.ADMIN,
    isTherapist: userRole === UserRole.THERAPIST,
    isReceptionist: userRole === UserRole.RECEPTIONIST,
    isPatient: userRole === UserRole.PATIENT,
    isStaff: userRole === UserRole.ADMIN || userRole === UserRole.RECEPTIONIST,
    refreshRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

// Convenience hooks for specific checks
export function useIsAdmin(): boolean {
  const { isAdmin } = useRole();
  return isAdmin;
}

export function useIsTherapist(): boolean {
  const { isTherapist } = useRole();
  return isTherapist;
}

export function useIsReceptionist(): boolean {
  const { isReceptionist } = useRole();
  return isReceptionist;
}

export function useIsPatient(): boolean {
  const { isPatient } = useRole();
  return isPatient;
}

export function useIsStaff(): boolean {
  const { isStaff } = useRole();
  return isStaff;
}

export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = useRole();
  return hasPermission(permission);
}

export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { hasAnyPermission } = useRole();
  return hasAnyPermission(permissions);
}
