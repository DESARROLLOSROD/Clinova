import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    sessionsMonth: 0,
    revenueMonth: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const [
        { count: patientsCount },
        { count: appointmentsCount },
        { count: sessionsMonthCount },
        { data: paymentsData }
      ] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('appointments').select('*', { count: 'exact', head: true })
          .gte('start_time', todayStart)
          .lte('start_time', todayEnd),
        supabase.from('sessions').select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart),
        supabase.from('payments').select('amount, status').gte('payment_date', monthStart),
      ]);

      const monthlyRevenue = paymentsData
        ?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      const pendingAmt = paymentsData
        ?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setStats({
        patients: patientsCount || 0,
        appointments: appointmentsCount || 0,
        sessionsMonth: sessionsMonthCount || 0,
        revenueMonth: monthlyRevenue,
        pendingPayments: pendingAmt,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Hola,</Text>
        <Text style={styles.userName}>{user?.user_metadata?.first_name || 'Terapeuta'}</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Citas Hoy"
          value={stats.appointments}
          icon="calendar-check"
          color="#2563eb"
        />
        <StatCard
          title="Pacientes"
          value={stats.patients}
          icon="users"
          color="#8b5cf6"
        />
        <StatCard
          title="Sesiones"
          value={stats.sessionsMonth}
          icon="notes-medical"
          color="#06b6d4"
        />
      </View>

      <View style={styles.financialSection}>
        <View style={[styles.financialCard, { borderLeftColor: '#10b981' }]}>
          <View style={styles.financialInfo}>
            <Text style={styles.financialLabel}>Ingresos (Mes)</Text>
            <Text style={[styles.financialValue, { color: '#10b981' }]}>
              ${stats.revenueMonth.toFixed(2)}
            </Text>
          </View>
          <FontAwesome5 name="dollar-sign" size={20} color="#10b981" />
        </View>
        <View style={[styles.financialCard, { borderLeftColor: '#f59e0b' }]}>
          <View style={styles.financialInfo}>
            <Text style={styles.financialLabel}>Pendiente</Text>
            <Text style={[styles.financialValue, { color: '#f59e0b' }]}>
              ${stats.pendingPayments.toFixed(2)}
            </Text>
          </View>
          <FontAwesome5 name="exclamation-circle" size={20} color="#f59e0b" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actions}>
          <ActionButton title="Nueva Cita" icon="calendar-plus" />
          <ActionButton title="Registrar Pago" icon="hand-holding-usd" />
          <ActionButton title="Nuevo Paciente" icon="user-plus" />
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <View style={styles.card}>
      <RNView style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <FontAwesome5 name={icon} size={20} color={color} />
      </RNView>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}

function ActionButton({ title, icon }: any) {
  return (
    <TouchableOpacity style={styles.actionButton}>
      <FontAwesome5 name={icon} size={24} color="#2563eb" />
      <Text style={styles.actionText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  welcome: {
    fontSize: 16,
    color: '#64748b',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    width: '31%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardTitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  financialSection: {
    backgroundColor: 'transparent',
    marginBottom: 32,
    gap: 12,
  },
  financialCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  financialInfo: {
    backgroundColor: 'transparent',
  },
  financialLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  financialValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  actionButton: {
    backgroundColor: '#fff',
    width: '32%',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 8,
    textAlign: 'center',
  },
});
