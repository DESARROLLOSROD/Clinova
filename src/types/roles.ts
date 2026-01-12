/**
 * Role and Permission Type Definitions
 * Defines the access control system for the Clinova application
 */

// User Roles
export enum UserRole {
  SUPER_ADMIN = 'super_admin',      // Platform owner - can manage all clinics
  CLINIC_MANAGER = 'clinic_manager', // Clinic owner - manages their specific clinic
  THERAPIST = 'therapist',           // Physiotherapist - manages patients and sessions
  RECEPTIONIST = 'receptionist',     // Front desk - manages appointments and payments
  PATIENT = 'patient',               // Patient - views their own data
}


// Permission Categories
export enum Permission {
  // Therapist Management
  THERAPIST_VIEW_ALL = 'therapist:view:all',
  THERAPIST_VIEW_OWN = 'therapist:view:own',
  THERAPIST_CREATE = 'therapist:create',
  THERAPIST_UPDATE_ALL = 'therapist:update:all',
  THERAPIST_UPDATE_OWN = 'therapist:update:own',
  THERAPIST_DELETE = 'therapist:delete',

  // Patient Management
  PATIENT_VIEW_ALL = 'patient:view:all',
  PATIENT_VIEW_ASSIGNED = 'patient:view:assigned',
  PATIENT_VIEW_OWN = 'patient:view:own',
  PATIENT_CREATE = 'patient:create',
  PATIENT_UPDATE_ALL = 'patient:update:all',
  PATIENT_UPDATE_ASSIGNED = 'patient:update:assigned',
  PATIENT_UPDATE_OWN = 'patient:update:own',
  PATIENT_DELETE = 'patient:delete',

  // Appointment Management
  APPOINTMENT_VIEW_ALL = 'appointment:view:all',
  APPOINTMENT_VIEW_ASSIGNED = 'appointment:view:assigned',
  APPOINTMENT_VIEW_OWN = 'appointment:view:own',
  APPOINTMENT_CREATE = 'appointment:create',
  APPOINTMENT_UPDATE_ALL = 'appointment:update:all',
  APPOINTMENT_UPDATE_ASSIGNED = 'appointment:update:assigned',
  APPOINTMENT_UPDATE_OWN = 'appointment:update:own',
  APPOINTMENT_DELETE = 'appointment:delete',

  // Session Management
  SESSION_VIEW_ALL = 'session:view:all',
  SESSION_VIEW_ASSIGNED = 'session:view:assigned',
  SESSION_VIEW_OWN = 'session:view:own',
  SESSION_CREATE = 'session:create',
  SESSION_UPDATE_ALL = 'session:update:all',
  SESSION_UPDATE_ASSIGNED = 'session:update:assigned',
  SESSION_UPDATE_OWN = 'session:update:own',
  SESSION_DELETE = 'session:delete',

  // Payment Management
  PAYMENT_VIEW_ALL = 'payment:view:all',
  PAYMENT_VIEW_ASSIGNED = 'payment:view:assigned',
  PAYMENT_VIEW_OWN = 'payment:view:own',
  PAYMENT_CREATE = 'payment:create',
  PAYMENT_UPDATE_ALL = 'payment:update:all',
  PAYMENT_UPDATE_ASSIGNED = 'payment:update:assigned',
  PAYMENT_DELETE = 'payment:delete',

  // Report Management
  REPORT_VIEW_ALL = 'report:view:all',
  REPORT_VIEW_ASSIGNED = 'report:view:assigned',
  REPORT_VIEW_OWN = 'report:view:own',
  REPORT_CREATE = 'report:create',

  // Exercise & Template Management
  EXERCISE_VIEW = 'exercise:view',
  EXERCISE_CREATE = 'exercise:create',
  EXERCISE_UPDATE = 'exercise:update',
  EXERCISE_DELETE = 'exercise:delete',
  TEMPLATE_VIEW = 'template:view',
  TEMPLATE_CREATE = 'template:create',
  TEMPLATE_UPDATE = 'template:update',
  TEMPLATE_DELETE = 'template:delete',

  // System Configuration
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_UPDATE = 'settings:update',

  // User Management
  USER_CREATE = 'user:create',
  USER_UPDATE_ALL = 'user:update:all',
  USER_DELETE = 'user:delete',

  // Clinic Management (Super Admin only)
  CLINIC_VIEW_ALL = 'clinic:view:all',
  CLINIC_CREATE = 'clinic:create',
  CLINIC_UPDATE_ALL = 'clinic:update:all',
  CLINIC_DELETE = 'clinic:delete',
  CLINIC_VIEW_ANALYTICS = 'clinic:view:analytics',
}


// Role Permission Mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Super Admin has ALL permissions including clinic management
    Permission.CLINIC_VIEW_ALL,
    Permission.CLINIC_CREATE,
    Permission.CLINIC_UPDATE_ALL,
    Permission.CLINIC_DELETE,
    Permission.CLINIC_VIEW_ANALYTICS,
    Permission.THERAPIST_VIEW_ALL,
    Permission.THERAPIST_CREATE,
    Permission.THERAPIST_UPDATE_ALL,
    Permission.THERAPIST_DELETE,
    Permission.PATIENT_VIEW_ALL,
    Permission.PATIENT_CREATE,
    Permission.PATIENT_UPDATE_ALL,
    Permission.PATIENT_DELETE,
    Permission.APPOINTMENT_VIEW_ALL,
    Permission.APPOINTMENT_CREATE,
    Permission.APPOINTMENT_UPDATE_ALL,
    Permission.APPOINTMENT_DELETE,
    Permission.SESSION_VIEW_ALL,
    Permission.SESSION_CREATE,
    Permission.SESSION_UPDATE_ALL,
    Permission.SESSION_DELETE,
    Permission.PAYMENT_VIEW_ALL,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_UPDATE_ALL,
    Permission.PAYMENT_DELETE,
    Permission.REPORT_VIEW_ALL,
    Permission.REPORT_CREATE,
    Permission.EXERCISE_VIEW,
    Permission.EXERCISE_CREATE,
    Permission.EXERCISE_UPDATE,
    Permission.EXERCISE_DELETE,
    Permission.TEMPLATE_VIEW,
    Permission.TEMPLATE_CREATE,
    Permission.TEMPLATE_UPDATE,
    Permission.TEMPLATE_DELETE,
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE,
    Permission.USER_CREATE,
    Permission.USER_UPDATE_ALL,
    Permission.USER_DELETE,
  ],

  [UserRole.CLINIC_MANAGER]: [
    // Clinic Manager has full access to their clinic (same as old ADMIN)
    Permission.THERAPIST_VIEW_ALL,
    Permission.THERAPIST_CREATE,
    Permission.THERAPIST_UPDATE_ALL,
    Permission.THERAPIST_DELETE,
    Permission.PATIENT_VIEW_ALL,
    Permission.PATIENT_CREATE,
    Permission.PATIENT_UPDATE_ALL,
    Permission.PATIENT_DELETE,
    Permission.APPOINTMENT_VIEW_ALL,
    Permission.APPOINTMENT_CREATE,
    Permission.APPOINTMENT_UPDATE_ALL,
    Permission.APPOINTMENT_DELETE,
    Permission.SESSION_VIEW_ALL,
    Permission.SESSION_CREATE,
    Permission.SESSION_UPDATE_ALL,
    Permission.SESSION_DELETE,
    Permission.PAYMENT_VIEW_ALL,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_UPDATE_ALL,
    Permission.PAYMENT_DELETE,
    Permission.REPORT_VIEW_ALL,
    Permission.REPORT_CREATE,
    Permission.EXERCISE_VIEW,
    Permission.EXERCISE_CREATE,
    Permission.EXERCISE_UPDATE,
    Permission.EXERCISE_DELETE,
    Permission.TEMPLATE_VIEW,
    Permission.TEMPLATE_CREATE,
    Permission.TEMPLATE_UPDATE,
    Permission.TEMPLATE_DELETE,
    Permission.SETTINGS_VIEW,
    Permission.SETTINGS_UPDATE,
    Permission.USER_CREATE,
    Permission.USER_UPDATE_ALL,
    Permission.USER_DELETE,
  ],

  [UserRole.THERAPIST]: [
    // View own profile
    Permission.THERAPIST_VIEW_OWN,
    Permission.THERAPIST_UPDATE_OWN,

    // Manage assigned patients
    Permission.PATIENT_VIEW_ASSIGNED,
    Permission.PATIENT_CREATE,
    Permission.PATIENT_UPDATE_ASSIGNED,

    // Manage assigned appointments
    Permission.APPOINTMENT_VIEW_ASSIGNED,
    Permission.APPOINTMENT_CREATE,
    Permission.APPOINTMENT_UPDATE_ASSIGNED,

    // Manage assigned sessions
    Permission.SESSION_VIEW_ASSIGNED,
    Permission.SESSION_CREATE,
    Permission.SESSION_UPDATE_ASSIGNED,

    // View and create payments for assigned patients
    Permission.PAYMENT_VIEW_ASSIGNED,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_UPDATE_ASSIGNED,

    // Generate reports for assigned patients
    Permission.REPORT_VIEW_ASSIGNED,
    Permission.REPORT_CREATE,

    // Manage exercises and templates
    Permission.EXERCISE_VIEW,
    Permission.EXERCISE_CREATE,
    Permission.EXERCISE_UPDATE,
    Permission.TEMPLATE_VIEW,
    Permission.TEMPLATE_CREATE,
    Permission.TEMPLATE_UPDATE,

    // View basic settings
    Permission.SETTINGS_VIEW,
  ],

  [UserRole.RECEPTIONIST]: [
    // View all therapists
    Permission.THERAPIST_VIEW_ALL,

    // Manage all patients
    Permission.PATIENT_VIEW_ALL,
    Permission.PATIENT_CREATE,
    Permission.PATIENT_UPDATE_ALL,

    // Manage all appointments
    Permission.APPOINTMENT_VIEW_ALL,
    Permission.APPOINTMENT_CREATE,
    Permission.APPOINTMENT_UPDATE_ALL,

    // View sessions
    Permission.SESSION_VIEW_ALL,

    // Manage payments
    Permission.PAYMENT_VIEW_ALL,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_UPDATE_ALL,

    // View exercises and templates
    Permission.EXERCISE_VIEW,
    Permission.TEMPLATE_VIEW,

    // View basic settings
    Permission.SETTINGS_VIEW,
  ],

  [UserRole.PATIENT]: [
    // View own data only
    Permission.PATIENT_VIEW_OWN,
    Permission.PATIENT_UPDATE_OWN,
    Permission.APPOINTMENT_VIEW_OWN,
    Permission.SESSION_VIEW_OWN,
    Permission.PAYMENT_VIEW_OWN,
    Permission.REPORT_VIEW_OWN,
    Permission.EXERCISE_VIEW,
  ],
};


// Type for user with role
export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
  metadata?: {
    first_name?: string;
    last_name?: string;
    [key: string]: any;
  };
}

// Type for role check result
export interface RoleCheckResult {
  hasRole: boolean;
  hasPermission: boolean;
  userRole?: UserRole;
  requiredRole?: UserRole;
  requiredPermission?: Permission;
}
