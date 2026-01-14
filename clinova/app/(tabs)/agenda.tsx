import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  View as RNView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { supabase } from '../../lib/supabase';
import { FontAwesome5 } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'expo-router';

export default function AgendaScreen() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  async function fetchAppointments() {
    setLoading(true);
    try {
      // Get appointments for the selected date
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(first_name, last_name),
          therapist:therapists(first_name, last_name)
        `)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const renderAppointment = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={() => router.push({ pathname: '/patient-detail', params: { id: item.patient_id } })}
    >
      <RNView style={styles.timeContainer}>
        <Text style={styles.timeText}>{format(new Date(item.start_time), 'HH:mm')}</Text>
        <RNView style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
      </RNView>

      <RNView style={styles.mainInfo}>
        <Text style={styles.patientName}>
          {item.patient?.first_name} {item.patient?.last_name}
        </Text>
        <Text style={styles.therapistName}>
          {item.therapist?.first_name} {item.therapist?.last_name}
        </Text>
        {item.reason && <Text style={styles.reasonText}>{item.reason}</Text>}
      </RNView>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push({
          pathname: '/session-form',
          params: { patientId: item.patient_id, appointmentId: item.id }
        })}
      >
        <FontAwesome5 name="clipboard-check" size={16} color="#2563eb" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateTitle}>
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
        </Text>
        <RNView style={styles.dateSelector}>
          <TouchableOpacity
            onPress={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
          >
            <FontAwesome5 name="chevron-left" size={16} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
            <Text style={styles.todayText}>Hoy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
          >
            <FontAwesome5 name="chevron-right" size={16} color="#64748b" />
          </TouchableOpacity>
        </RNView>
      </View>

      {loading && !refreshing ? (
        <RNView style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </RNView>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <RNView style={styles.emptyContainer}>
              <FontAwesome5 name="calendar-times" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No hay citas para este día</Text>
            </RNView>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    textTransform: 'capitalize',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'transparent',
  },
  todayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  listContent: {
    padding: 16,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeContainer: {
    alignItems: 'center',
    width: 60,
    backgroundColor: 'transparent',
  },
  timeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mainInfo: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: 'transparent',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  therapistName: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  reasonText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
    backgroundColor: 'transparent',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
