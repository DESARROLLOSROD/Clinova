import { createClient } from '@/utils/supabase/server';
import { TrendingUp, Users, DollarSign, Calendar, Activity, TrendingDown } from 'lucide-react';
import { StatsCharts } from '@/components/dashboard/StatsCharts';
import { KPICard } from '@/components/dashboard/KPICard';

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
    (newPatientsLastMonth || 0) > 0
      ? (((newPatientsThisMonth || 0) - (newPatientsLastMonth || 0)) / (newPatientsLastMonth || 0)) * 100
      : 0;

  const sessionGrowth =
    (sessionsLastMonth || 0) > 0
      ? (((sessionsThisMonth || 0) - (sessionsLastMonth || 0)) / (sessionsLastMonth || 0)) * 100
      : 0;

  const revenueGrowth =
    totalRevenueLastMonth > 0
      ? ((totalRevenueThisMonth - totalRevenueLastMonth) / totalRevenueLastMonth) * 100
      : 0;

  const completionRate =
    (completedAppointments || 0) + (cancelledAppointments || 0) + (noShowAppointments || 0) > 0
      ? ((completedAppointments || 0) /
        ((completedAppointments || 0) + (cancelledAppointments || 0) + (noShowAppointments || 0))) *
      100
      : 0;

  // Estadísticas para Gráficos (Últimos 6 meses)
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1).toISOString();

  // Fetch Payments for Chart
  const { data: paymentsChartData } = await supabase
    .from('payments')
    .select('amount, payment_date')
    .eq('status', 'completed')
    .gte('payment_date', sixMonthsAgo)
    .order('payment_date', { ascending: true });

  // Fetch Sessions for Chart
  const { data: sessionsChartData } = await supabase
    .from('sessions')
    .select('created_at')
    .gte('created_at', sixMonthsAgo)
    .order('created_at', { ascending: true });

  // Process Revenue Data
  const revenueByMonth = (paymentsChartData || []).reduce((acc: any, payment) => {
    const month = new Date(payment.payment_date).toLocaleDateString('es-MX', { month: 'short' });
    acc[month] = (acc[month] || 0) + payment.amount;
    return acc;
  }, {});

  const revenueData = Object.entries(revenueByMonth).map(([name, value]) => ({
    name: (name as string).charAt(0).toUpperCase() + (name as string).slice(1),
    value: value as number
  }));

  // Process Sessions Data
  const sessionsByMonth = (sessionsChartData || []).reduce((acc: any, session) => {
    const month = new Date(session.created_at).toLocaleDateString('es-MX', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const sessionsData = Object.entries(sessionsByMonth).map(([name, value]) => ({
    name: (name as string).charAt(0).toUpperCase() + (name as string).slice(1),
    value: value as number
  }));

  // Patient Distribution Data
  const patientDistribution = [
    { name: 'Activos', value: activePatients || 0, fill: '#3b82f6' },
    { name: 'Inactivos', value: (totalPatients || 0) - (activePatients || 0), fill: '#94a3b8' },
  ];

  return (
    <div className="space-y-8 transition-colors pb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Reportes y Estadísticas</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visión general del rendimiento de tu clínica y métricas clave.
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Pacientes"
          value={totalPatients || 0}
          subValue={`${activePatients} activos`}
          icon={Users}
          color="blue"
          trend={{
            value: patientGrowth,
            positive: true
          }}
        />
        <KPICard
          title="Citas (Mes)"
          value={appointmentsThisMonth || 0}
          subValue={`${completionRate.toFixed(0)}% completadas`}
          icon={Calendar}
          color="purple"
        />
        <KPICard
          title="Sesiones (Mes)"
          value={sessionsThisMonth || 0}
          icon={Activity}
          color="indigo"
          trend={{
            value: sessionGrowth,
            positive: true
          }}
        />
        <KPICard
          title="Ingresos (Mes)"
          value={`$${totalRevenueThisMonth.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend={{
            value: revenueGrowth,
            positive: true
          }}
        />
      </div>

      {/* Gráficos Principales */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Análisis Visual</h2>
        <StatsCharts
          sessionsData={sessionsData}
          revenueData={revenueData}
          patientDistribution={patientDistribution}
        />
      </div>

      {/* Secciones de Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tendencias de Pacientes */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            Crecimiento de Pacientes
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-base text-gray-600 dark:text-gray-400">Nuevos Este Mes</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{newPatientsThisMonth || 0}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(((newPatientsThisMonth || 0) / (totalPatients || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-base text-gray-600 dark:text-gray-400">Mes Anterior</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{newPatientsLastMonth || 0}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                <div
                  className="bg-gray-400 dark:bg-gray-600 h-3 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(((newPatientsLastMonth || 0) / (totalPatients || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Tasa de Crecimiento</span>
              <span
                className={`text-2xl font-bold flex items-center gap-1 ${patientGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {patientGrowth >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                {Math.abs(patientGrowth).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="text-green-600 dark:text-green-400" size={20} />
            </div>
            Resumen Financiero
          </h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Este Mes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  ${totalRevenueThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Mes Anterior</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  ${totalRevenueLastMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl">
              <div>
                <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-500 mt-1">
                  ${totalPendingPayments.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="text-amber-500 dark:text-amber-400 opacity-50" size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
