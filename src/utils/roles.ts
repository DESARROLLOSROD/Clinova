/**
 * Role and Permission Utility Functions
 * Provides helper functions for role-based access control
 */

import { createClient } from '@/utils/supabase/server';
import { UserRole, Permission, ROLE_PERMISSIONS, UserWithRole, RoleCheckResult } from '@/types/roles';
import { User } from '@supabase/supabase-js';

/**
 * Get the role of the current authenticated user
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return getUserRole(user);
}

/**
 * Get the role from a user object
 */
export function getUserRole(user: User | null): UserRole | null {
  if (!user) return null;

  // Check user_metadata first (set during user creation)
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
}

/**
 * Get user with role information
 */
export async function getCurrentUserWithRole(): Promise<UserWithRole | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const role = getUserRole(user);
  if (!role) return null;

  return {
    id: user.id,
    email: user.email!,
    role,
    metadata: user.user_metadata,
  };
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole === requiredRole;
}

/**
 * Check if current user has one of multiple roles
 */
export async function hasAnyRole(requiredRoles: UserRole[]): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  return userRole ? requiredRoles.includes(userRole) : false;
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  if (!userRole) return false;

  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
}

/**
 * Check if current user has any of multiple permissions
 */
export async function hasAnyPermission(permissions: Permission[]): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  if (!userRole) return false;

  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return permissions.some(permission => rolePermissions.includes(permission));
}

/**
 * Check if current user has all of multiple permissions
 */
export async function hasAllPermissions(permissions: Permission[]): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  if (!userRole) return false;

  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return permissions.every(permission => rolePermissions.includes(permission));
}

/**
 * Get all permissions for current user's role
 */
export async function getCurrentUserPermissions(): Promise<Permission[]> {
  const userRole = await getCurrentUserRole();
  if (!userRole) return [];

  return ROLE_PERMISSIONS[userRole];
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(UserRole.ADMIN);
}

/**
 * Check if user is therapist
 */
export async function isTherapist(): Promise<boolean> {
  return hasRole(UserRole.THERAPIST);
}

/**
 * Check if user is receptionist
 */
export async function isReceptionist(): Promise<boolean> {
  return hasRole(UserRole.RECEPTIONIST);
}

/**
 * Check if user is patient
 */
export async function isPatient(): Promise<boolean> {
  return hasRole(UserRole.PATIENT);
}

/**
 * Check if user has staff role (admin or receptionist)
 */
export async function isStaff(): Promise<boolean> {
  return hasAnyRole([UserRole.ADMIN, UserRole.RECEPTIONIST]);
}

/**
 * Check if user can manage therapists
 */
export async function canManageTherapists(): Promise<boolean> {
  return hasAnyPermission([
    Permission.THERAPIST_CREATE,
    Permission.THERAPIST_UPDATE_ALL,
    Permission.THERAPIST_DELETE,
  ]);
}

/**
 * Check if user can manage patients
 */
export async function canManagePatients(): Promise<boolean> {
  return hasAnyPermission([
    Permission.PATIENT_CREATE,
    Permission.PATIENT_UPDATE_ALL,
    Permission.PATIENT_UPDATE_ASSIGNED,
    Permission.PATIENT_DELETE,
  ]);
}

/**
 * Check if user can view all patients or only assigned ones
 */
export async function canViewAllPatients(): Promise<boolean> {
  return hasPermission(Permission.PATIENT_VIEW_ALL);
}

/**
 * Check if user can manage appointments
 */
export async function canManageAppointments(): Promise<boolean> {
  return hasAnyPermission([
    Permission.APPOINTMENT_CREATE,
    Permission.APPOINTMENT_UPDATE_ALL,
    Permission.APPOINTMENT_UPDATE_ASSIGNED,
  ]);
}

/**
 * Check if user can manage sessions
 */
export async function canManageSessions(): Promise<boolean> {
  return hasAnyPermission([
    Permission.SESSION_CREATE,
    Permission.SESSION_UPDATE_ALL,
    Permission.SESSION_UPDATE_ASSIGNED,
  ]);
}

/**
 * Check if user can manage payments
 */
export async function canManagePayments(): Promise<boolean> {
  return hasAnyPermission([
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_UPDATE_ALL,
    Permission.PAYMENT_UPDATE_ASSIGNED,
  ]);
}

/**
 * Check if user can access settings
 */
export async function canAccessSettings(): Promise<boolean> {
  return hasPermission(Permission.SETTINGS_VIEW);
}

/**
 * Check if user can update settings
 */
export async function canUpdateSettings(): Promise<boolean> {
  return hasPermission(Permission.SETTINGS_UPDATE);
}

/**
 * Comprehensive role check with detailed result
 */
export async function checkRoleAccess(
  requiredRole?: UserRole,
  requiredPermission?: Permission
): Promise<RoleCheckResult> {
  const userRole = await getCurrentUserRole();

  const result: RoleCheckResult = {
    hasRole: false,
    hasPermission: false,
    userRole: userRole || undefined,
    requiredRole,
    requiredPermission,
  };

  if (!userRole) {
    return result;
  }

  // Check role if specified
  if (requiredRole) {
    result.hasRole = userRole === requiredRole;
  }

  // Check permission if specified
  if (requiredPermission) {
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    result.hasPermission = rolePermissions.includes(requiredPermission);
  }

  return result;
}

/**
 * Assign role to user (must be called with service role)
 */
export async function assignRoleToUser(
  userId: string,
  role: UserRole,
  assignedBy?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Get role ID
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', role)
    .single();

  if (roleError || !roleData) {
    return { success: false, error: 'Role not found' };
  }

  // Check if user already has this role
  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role_id', roleData.id)
    .single();

  if (existingRole) {
    return { success: true }; // Already assigned
  }

  // Assign role
  const { error: assignError } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: roleData.id,
      assigned_by: assignedBy || null,
    });

  if (assignError) {
    return { success: false, error: assignError.message };
  }

  return { success: true };
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.THERAPIST]: 'Fisioterapeuta',
    [UserRole.RECEPTIONIST]: 'Recepcionista',
    [UserRole.PATIENT]: 'Paciente',
  };

  return displayNames[role] || role;
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return Object.values(UserRole);
}

/**
 * Validate if a string is a valid role
 */
export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}
