'use client';

import { useEffect, useState } from 'react';
import { getCurrentClinicId, getCurrentClinic, hasRole } from '@/lib/utils/clinic';

interface Clinic {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  subscription_tier?: string;
  subscription_status?: string;
  logo_url?: string;
  primary_color?: string;
}

interface UseClinicReturn {
  clinicId: string | null;
  clinic: Clinic | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener el clinic_id del usuario actual
 * @returns {UseClinicReturn} Objeto con clinicId, loading y error
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { clinicId, loading } = useClinic();
 *
 *   if (loading) return <div>Cargando...</div>;
 *
 *   return <div>Tu clínica: {clinicId}</div>;
 * }
 * ```
 */
export function useClinic(): UseClinicReturn {
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClinic = async () => {
    try {
      setLoading(true);
      setError(null);

      const [id, fullClinic] = await Promise.all([
        getCurrentClinicId(),
        getCurrentClinic()
      ]);

      setClinicId(id);
      // fullClinic viene como un objeto, no como array
      setClinic(fullClinic as unknown as Clinic);
    } catch (err) {
      console.error('Error loading clinic:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinic();
  }, []);

  return {
    clinicId,
    clinic,
    loading,
    error,
    refetch: fetchClinic
  };
}

interface UseRoleReturn {
  hasPermission: boolean;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook para verificar si el usuario tiene un rol específico
 * @param role El rol o roles a verificar
 * @returns {UseRoleReturn} Objeto con hasPermission, loading y error
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { hasPermission, loading } = useRole('admin');
 *
 *   if (loading) return <div>Cargando...</div>;
 *   if (!hasPermission) return <div>No autorizado</div>;
 *
 *   return <div>Panel de Administración</div>;
 * }
 * ```
 */
export function useRole(role: string | string[]): UseRoleReturn {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkRole() {
      try {
        setLoading(true);
        setError(null);
        const permitted = await hasRole(role);
        setHasPermission(permitted);
      } catch (err) {
        console.error('Error checking role:', err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, [role]);

  return { hasPermission, loading, error };
}
