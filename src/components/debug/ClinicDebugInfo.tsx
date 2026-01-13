'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DebugInfo {
  userId: string | null;
  userEmail: string | null;
  clinicId: string | null;
  clinicName: string | null;
  role: string | null;
  totalClinics: number;
  patientsCount: number;
  appointmentsCount: number;
  rlsEnabled: boolean;
}

/**
 * Componente de depuración para mostrar información sobre el aislamiento de datos
 * SOLO PARA DESARROLLO - Remover en producción
 */
export function ClinicDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDebugInfo() {
      try {
        const supabase = createClient();

        // 1. Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // 2. Obtener perfil del usuario con información de clínica
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select(`
            id,
            role,
            clinic_id,
            clinics:clinic_id (
              id,
              name,
              slug
            )
          `)
          .eq('id', user?.id || '')
          .single();

        if (profileError) throw profileError;

        // 3. Contar total de clínicas en el sistema
        const { count: totalClinics } = await supabase
          .from('clinics')
          .select('*', { count: 'exact', head: true });

        // 4. Contar pacientes que veo (con RLS)
        const { count: patientsCount } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });

        // 5. Contar citas que veo (con RLS)
        const { count: appointmentsCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true });

        // 6. Verificar si RLS está funcionando
        // Si veo datos de mi clínica pero no de otras, RLS funciona
        const { data: allPatients } = await supabase
          .from('patients')
          .select('clinic_id')
          .limit(100);

        const uniqueClinicIds = new Set(allPatients?.map(p => p.clinic_id) || []);
        const rlsEnabled = uniqueClinicIds.size === 1 && uniqueClinicIds.has(profile.clinic_id);

        setDebugInfo({
          userId: user?.id || null,
          userEmail: user?.email || null,
          clinicId: profile.clinic_id,
          clinicName: (profile.clinics as any)?.name || null,
          role: profile.role,
          totalClinics: totalClinics || 0,
          patientsCount: patientsCount || 0,
          appointmentsCount: appointmentsCount || 0,
          rlsEnabled,
        });
      } catch (err) {
        console.error('Error loading debug info:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    loadDebugInfo();
  }, []);

  if (loading) {
    return (
      <Card className="border-yellow-500">
        <CardHeader>
          <CardTitle className="text-sm">Cargando información de depuración...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="text-sm text-red-600">Error de Depuración</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!debugInfo) return null;

  return (
    <Card className="border-blue-500">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          🔍 Información de Depuración - Aislamiento de Clínicas
          {debugInfo.rlsEnabled ? (
            <Badge variant="default" className="bg-green-500">RLS Activo</Badge>
          ) : (
            <Badge variant="destructive">RLS Inactivo o Datos Mezclados</Badge>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          Solo visible en desarrollo - Remover en producción
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="font-semibold text-gray-600">Usuario ID:</p>
            <p className="font-mono text-xs break-all">{debugInfo.userId}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-600">Email:</p>
            <p>{debugInfo.userEmail}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-600">Rol:</p>
            <Badge variant="outline">{debugInfo.role}</Badge>
          </div>
          <div>
            <p className="font-semibold text-gray-600">Clínica Asignada:</p>
            <p className="font-semibold">{debugInfo.clinicName || 'Sin asignar'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-600">Clinic ID:</p>
            <p className="font-mono text-xs break-all">{debugInfo.clinicId || 'N/A'}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-600">Total de Clínicas:</p>
            <p className="font-bold">{debugInfo.totalClinics}</p>
          </div>
        </div>

        <div className="border-t pt-2 mt-2">
          <p className="font-semibold text-gray-600 mb-2">Datos Visibles (con RLS):</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-500">Pacientes:</p>
              <p className="font-bold text-lg">{debugInfo.patientsCount}</p>
            </div>
            <div>
              <p className="text-gray-500">Citas:</p>
              <p className="font-bold text-lg">{debugInfo.appointmentsCount}</p>
            </div>
          </div>
        </div>

        {!debugInfo.rlsEnabled && (
          <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
            <p className="text-red-800 font-semibold">⚠️ Advertencia</p>
            <p className="text-red-600 text-xs mt-1">
              RLS puede no estar funcionando correctamente. Estás viendo datos de múltiples clínicas.
              Ejecuta la migración de aislamiento de datos.
            </p>
          </div>
        )}

        {debugInfo.totalClinics > 1 && debugInfo.rlsEnabled && (
          <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
            <p className="text-green-800 font-semibold">✅ Correcto</p>
            <p className="text-green-600 text-xs mt-1">
              RLS está funcionando. Hay {debugInfo.totalClinics} clínicas pero solo ves datos de tu clínica.
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
          <p>Para más información, consulta: <code className="bg-gray-100 px-1 rounded">supabase/CLINIC_DATA_ISOLATION.md</code></p>
        </div>
      </CardContent>
    </Card>
  );
}
