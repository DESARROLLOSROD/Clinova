'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { initPushNotifications } from '@/lib/mobile-notifications'

export type UserRole = 'super_admin' | 'clinic_manager' | 'therapist' | 'receptionist' | 'patient'


export interface UserProfile {
  id: string
  role: UserRole
  clinic_id: string
  full_name: string
  professional_title: string | null
  phone: string | null
  avatar_url: string | null
  settings: {
    notifications_enabled: boolean
    email_reminders: boolean
    sms_reminders: boolean
    language: string
    theme: string
  }
  is_active: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
}

interface UserContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isSuperAdmin: boolean
  isClinicManager: boolean
  isAdmin: boolean  // true if super_admin OR clinic_manager
  isTherapist: boolean
  isReceptionist: boolean
  isPatient: boolean
  can: (permission: Permission) => boolean
  refreshProfile: () => Promise<void>
  viewAsClinic: (clinicId: string) => void
  stopImpersonating: () => void
  isImpersonating: boolean
}


const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: React.ReactNode;
  initialProfile?: UserProfile | null;
}

export function UserProvider({ children, initialProfile = null }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null) // For impersonation
  // Start with loading=true, will be set to false after client-side initialization
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data as UserProfile
  }

  const refreshProfile = async () => {
    if (!user) return
    const freshProfile = await fetchProfile(user.id)
    if (freshProfile) {
      if (originalProfile) {
        setOriginalProfile(freshProfile)
        // If impersonating, we might want to keep the impersonated clinic_id, or reset?
        // For simplicity, let's keep impersonation active but update other fields if needed.
        // Actually, safer to stop impersonating on refresh to avoid sync issues, or just update original.
      } else {
        setProfile(freshProfile)
      }
    }
  }

  const viewAsClinic = (clinicId: string) => {
    if (!profile || profile.role !== 'super_admin') return

    if (!originalProfile) {
      setOriginalProfile(profile)
    }

    // Create a modified profile with the target clinic_id
    // We keep the role as super_admin so permissions pass, but components using clinic_id will see the new one.
    setProfile({
      ...profile,
      clinic_id: clinicId
    })
  }

  const stopImpersonating = () => {
    if (originalProfile) {
      setProfile(originalProfile)
      setOriginalProfile(null)
    }
  }

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;



        // ... (in useEffect)
        if (authUser) {
          setUser(authUser);
          // Initialize Push Notifications if valid user
          initPushNotifications(authUser.id);

          // Only fetch profile if we don't have initialProfile
          if (!initialProfile) {
            const profileData = await fetchProfile(authUser.id);
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error in initializeUser:', error);
      } finally {
        setLoading(false);
      }
    };

    // Always initialize user on client side
    initializeUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
        if (event === 'SIGNED_IN') {
          await supabase
            .from('user_profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', session.user.id);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  const isSuperAdmin = profile?.role === 'super_admin'
  const isClinicManager = profile?.role === 'clinic_manager'
  const isAdmin = isSuperAdmin || isClinicManager  // Either super_admin or clinic_manager
  const isTherapist = profile?.role === 'therapist'
  const isReceptionist = profile?.role === 'receptionist'
  const isPatient = profile?.role === 'patient'

  const can = (permission: Permission): boolean => {
    if (!profile) return false
    if (isSuperAdmin) return true  // Super admin has all permissions
    if (isClinicManager) {
      // Clinic manager has all permissions except clinic management
      const clinicManagementPerms = ['clinic:view:all', 'clinic:create', 'clinic:update:all', 'clinic:delete', 'clinic:view:analytics']
      if (clinicManagementPerms.includes(permission)) return false
      return true
    }
    return permissions[profile.role]?.includes(permission) ?? false
  }

  const value = {
    user,
    profile,
    loading,
    isSuperAdmin,
    isClinicManager,
    isAdmin,
    isTherapist,
    isReceptionist,
    isPatient,
    can,
    refreshProfile,
    viewAsClinic,
    stopImpersonating,
    isImpersonating: !!originalProfile,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export type Permission =
  | 'patients:view'
  | 'patients:create'
  | 'patients:edit'
  | 'patients:delete'
  | 'medical_history:view'
  | 'medical_history:edit'
  | 'appointments:view_all'
  | 'appointments:view_own'
  | 'appointments:create'
  | 'appointments:edit'
  | 'appointments:delete'
  | 'sessions:view'
  | 'sessions:create'
  | 'sessions:edit'
  | 'exercises:view'
  | 'exercises:create'
  | 'exercises:prescribe'
  | 'payments:view_all'
  | 'payments:view_own'
  | 'payments:create'
  | 'payments:edit'
  | 'reports:view_all'
  | 'reports:view_own'
  | 'users:manage'
  | 'clinic:configure'

const permissions: Record<UserRole, Permission[]> = {
  super_admin: [], // Super admin handled in 'can' function directly
  clinic_manager: [], // Clinic manager handled in 'can' function directly
  therapist: [
    'patients:view',
    'patients:create',
    'patients:edit',
    'medical_history:view',
    'medical_history:edit',
    'appointments:view_own',
    'appointments:create',
    'appointments:edit',
    'sessions:view',
    'sessions:create',
    'sessions:edit',
    'exercises:view',
    'exercises:create',
    'exercises:prescribe',
    'payments:view_own',
    'reports:view_own',
  ],
  receptionist: [
    'patients:view',
    'patients:create',
    'patients:edit',
    'appointments:view_all',
    'appointments:create',
    'appointments:edit',
    'payments:view_all',
    'payments:create',
    'payments:edit',
  ],
  patient: [
    'payments:view_own',
  ],
}

