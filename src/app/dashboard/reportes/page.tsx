import { createClient } from '@/utils/supabase/server';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const supabase = await createClient();

  // Obtener fecha actual
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
  const last3Months = new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString();

  // Estadísticas de Pacientes
  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  const { count: activePatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  const { count: newPatientsThisMonth } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', currentMonth);

  const { count: newPatientsLastMonth } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', lastMonth)
    .lt('created_at', currentMonth);

  // Estadísticas de Citas
  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  const { count: appointmentsThisMonth } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('start_time', currentMonth);

  const { count: completedAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .gte('start_time', last3Months);

  const { count: cancelledAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelled')
    .gte('start_time', last3Months);

  const { count: noShowAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'no_show')
    .gte('start_time', last3Months);

  // Estadísticas de Sesiones
  const { count: totalSessions } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true });

  const { count: sessionsThisMonth } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', currentMonth);

  const { count: sessionsLastMonth } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', lastMonth)
    .lt('created_at', currentMonth);

  // Estadísticas Financieras
  const { data: revenueThisMonth } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .gte('payment_date', currentMonth);

  const { data: revenueLastMonth } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed')
    .gte('payment_date', lastMonth)
    .lt('payment_date', currentMonth);

  const { data: pendingPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'pending');

  const totalRevenueThisMonth = revenueThisMonth?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalRevenueLastMonth = revenueLastMonth?.reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalPendingPayments = pendingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  // Calcular porcentajes de cambio
  const patientGrowth =
    newPatientsLastMonth > 0
      ? ((newPatientsThisMonth - newPatientsLastMonth) / newPatientsLastMonth) * 100
      : 0;

  const sessionGrowth =
    sessionsLastMonth > 0
      ? ((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth) * 100
      : 0;

  const revenueGrowth =
    totalRevenueLastMonth > 0
      ? ((totalRevenueThisMonth - totalRevenueLastMonth) / totalRevenueLastMonth) * 100
      : 0;

  const completionRate =
    completedAppointments + cancelledAppointments + noShowAppointments > 0
      ? (completedAppointments /
          (completedAppointments + cancelledAppointments + noShowAppointments)) *
        100
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
        <p className="text-gray-600 text-sm mt-1">
          Análisis del rendimiento de tu clínica
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pacientes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalPatients || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{activePatients} activos</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Citas Este Mes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {appointmentsThisMonth || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {completionRate.toFixed(0)}% completadas
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sesiones Este Mes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{sessionsThisMonth || 0}</p>
              <p
                className={`text-xs mt-1 ${sessionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {sessionGrowth >= 0 ? '+' : ''}
                {sessionGrowth.toFixed(1)}% vs mes anterior
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Activity className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos Este Mes</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${totalRevenueThisMonth.toFixed(2)}
              </p>
              <p
                className={`text-xs mt-1 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {revenueGrowth >= 0 ? '+' : ''}
                {revenueGrowth.toFixed(1)}% vs mes anterior
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencias de Pacientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            Crecimiento de Pacientes
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Nuevos Este Mes</span>
                <span className="font-semibold text-gray-900">{newPatientsThisMonth || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((newPatientsThisMonth / (totalPatients || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Mes Anterior</span>
                <span className="font-semibold text-gray-900">{newPatientsLastMonth || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{
                    width: `${Math.min((newPatientsLastMonth / (totalPatients || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Tasa de Crecimiento</p>
              <p
                className={`text-2xl font-bold ${patientGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {patientGrowth >= 0 ? '+' : ''}
                {patientGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Estado de Citas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="text-purple-600" size={20} />
            Estado de Citas (Últimos 3 Meses)
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Completadas</span>
                <span className="font-semibold text-green-600">{completedAppointments || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${completionRate}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Canceladas</span>
                <span className="font-semibold text-red-600">{cancelledAppointments || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${((cancelledAppointments || 0) / ((completedAppointments || 0) + (cancelledAppointments || 0) + (noShowAppointments || 0) || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">No Asistieron</span>
                <span className="font-semibold text-orange-600">{noShowAppointments || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{
                    width: `${((noShowAppointments || 0) / ((completedAppointments || 0) + (cancelledAppointments || 0) + (noShowAppointments || 0) || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Tasa de Asistencia</p>
              <p className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="text-green-600" size={20} />
          Resumen Financiero
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600">Ingresos Este Mes</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ${totalRevenueThisMonth.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ingresos Mes Anterior</p>
            <p className="text-3xl font-bold text-gray-600 mt-2">
              ${totalRevenueLastMonth.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pagos Pendientes</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              ${totalPendingPayments.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
