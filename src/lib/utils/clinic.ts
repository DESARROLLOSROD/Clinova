import { createClient } from '@/utils/supabase/client';

/**
 * Obtiene el clinic_id del usuario autenticado actual
 * @throws Error si el usuario no está autenticado o no tiene clínica asignada
 * @returns Promise<string> El ID de la clínica
 */
export async function getCurrentClinicId(): Promise<string> {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('clinic_id')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  if (!data?.clinic_id) throw new Error('Usuario sin clínica asignada');

  return data.clinic_id;
}

/**
 * Obtiene información completa de la clínica del usuario actual
 * @returns Promise con los datos de la clínica
 */
export async function getCurrentClinic() {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      clinic_id,
      clinics:clinic_id (
        id,
        name,
        slug,
        email,
        phone,
        address,
        city,
        state,
        country,
        timezone,
        currency,
        language,
        subscription_tier,
        subscription_status,
        logo_url,
        primary_color
      )
    `)
    .eq('id', user.id)
    .single();

  if (error) throw error;
  if (!data?.clinic_id) throw new Error('Usuario sin clínica asignada');

  return data.clinics;
}

/**
 * Verifica si el usuario actual tiene un rol específico
 * @param role El rol a verificar (admin, clinic_manager, therapist, receptionist)
 * @returns Promise<boolean>
 */
export async function hasRole(role: string | string[]): Promise<boolean> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!data) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(data.role);
}

/**
 * Verifica si un clinic_id pertenece al usuario actual
 * Útil para validaciones de seguridad en el frontend
 * @param clinicId El ID de la clínica a verificar
 * @returns Promise<boolean>
 */
export async function isMyClinic(clinicId: string): Promise<boolean> {
  try {
    const myClinicId = await getCurrentClinicId();
    return myClinicId === clinicId;
  } catch {
    return false;
  }
}
