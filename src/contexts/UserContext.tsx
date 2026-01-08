'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

export type UserRole = 'admin' | 'therapist' | 'receptionist' | 'patient'

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
  isAdmin: boolean
  isTherapist: boolean
  isReceptionist: boolean
  isPatient: boolean
  can: (permission: Permission) => boolean
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: React.ReactNode;
  initialProfile?: UserProfile | null;
}

export function UserProvider({ children, initialProfile = null }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile)
  const [loading, setLoading] = useState(!initialProfile)
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
      setProfile(freshProfile)
    }
  }

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          setUser(user);
          if (!initialProfile) {
            const profileData = await fetchProfile(user.id);
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error in getUserProfile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialProfile) {
      getUserProfile();
    } else {
      setLoading(false);
    }

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
  }, [initialProfile]);


  const isAdmin = profile?.role === 'admin'
  const isTherapist = profile?.role === 'therapist'
  const isReceptionist = profile?.role === 'receptionist'
  const isPatient = profile?.role === 'patient'

  const can = (permission: Permission): boolean => {
    if (!profile) return false
    if (isAdmin) return true
    return permissions[profile.role]?.includes(permission) ?? false
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    isTherapist,
    isReceptionist,
    isPatient,
    can,
    refreshProfile,
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
  admin: [], // Admin can do everything, handled by the 'can' function directly
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
