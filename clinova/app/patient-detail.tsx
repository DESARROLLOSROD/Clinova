import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, View as RNView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { FontAwesome5 } from '@expo/vector-icons';

export default function PatientDetailScreen() {
    const { id } = useLocalSearchParams();
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (id) fetchPatientDetails();
    }, [id]);

    async function fetchPatientDetails() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setPatient(data);
        } catch (error) {
            console.error('Error fetching patient details:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (!patient) {
        return (
            <View style={styles.container}>
                <Text>Paciente no encontrado</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen
                options={{
                    title: 'Detalles del Paciente',
                    headerBackTitle: 'Atrás',
                }}
            />

            <View style={styles.header}>
                <RNView style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {patient.first_name[0]}{patient.last_name[0]}
                    </Text>
                </RNView>
                <Text style={styles.name}>{patient.first_name} {patient.last_name}</Text>
                <Text style={styles.email}>{patient.email || 'Sin correo registrado'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información Personal</Text>
                <InfoItem label="Teléfono" value={patient.phone || 'No registrado'} icon="phone" />
                <InfoItem label="Fecha de Nacimiento" value={patient.birth_date || 'No registrada'} icon="birthday-cake" />
                <InfoItem label="Género" value={patient.gender || 'No especificado'} icon="venus-mars" />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Historial Clínico</Text>
                <RNView style={styles.historyCard}>
                    <Text style={styles.historyLabel}>Motivo de consulta:</Text>
                    <Text style={styles.historyText}>{patient.consultation_reason || 'No registrado'}</Text>
                </RNView>
            </View>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push({
                    pathname: '/session-form',
                    params: { patientId: patient.id }
                })}
            >
                <FontAwesome5 name="plus-circle" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Nueva Sesión Clínica</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

function InfoItem({ label, value, icon }: any) {
    return (
        <RNView style={styles.infoItem}>
            <RNView style={styles.infoIconWrapper}>
                <FontAwesome5 name={icon} size={14} color="#64748b" />
            </RNView>
            <RNView style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
            </RNView>
        </RNView>
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        backgroundColor: 'transparent',
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    email: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoTextWrapper: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#334155',
    },
    historyCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    historyLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 4,
    },
    historyText: {
        fontSize: 14,
        color: '#1e293b',
        lineHeight: 20,
    },
    actionButton: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 40,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 10,
    },
});
