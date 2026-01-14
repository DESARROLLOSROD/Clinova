import React, { useState } from 'react';
import {
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    View as RNView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';
import BodyMap from '../components/BodyMap';

export default function SessionFormScreen() {
    const { patientId, appointmentId } = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();

    const [form, setForm] = useState({
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        pain_level: 0,
    });
    const [selectedZones, setSelectedZones] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleZone = (zoneId: string) => {
        setSelectedZones(prev =>
            prev.includes(zoneId)
                ? prev.filter(z => z !== zoneId)
                : [...prev, zoneId]
        );
    };

    async function handleSave() {
        if (!form.subjective || !form.objective || !form.assessment || !form.plan) {
            Alert.alert('Error', 'Por favor completa todos los campos SOAP.');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.from('sessions').insert([
                {
                    patient_id: patientId,
                    appointment_id: appointmentId,
                    therapist_id: user?.id,
                    subjective: form.subjective,
                    objective: form.objective,
                    assessment: form.assessment,
                    plan: form.plan,
                    pain_level: form.pain_level,
                    pain_zones: selectedZones.join(','),
                    session_date: new Date().toISOString(),
                },
            ]);

            if (error) throw error;

            // Update appointment status to completed if applicable
            if (appointmentId) {
                await supabase
                    .from('appointments')
                    .update({ status: 'completed' })
                    .eq('id', appointmentId);
            }

            Alert.alert('Éxito', 'Sesión guardada correctamente', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: 'Nueva Sesión (SOAP)' }} />

            <RNView style={styles.painSection}>
                <Text style={styles.sectionTitle}>Nivel de Dolor (0-10)</Text>
                <RNView style={styles.painGrid}>
                    {[...Array(11).keys()].map((num) => (
                        <TouchableOpacity
                            key={num}
                            style={[
                                styles.painButton,
                                form.pain_level === num && styles.painButtonSelected,
                            ]}
                            onPress={() => setForm({ ...form, pain_level: num })}
                        >
                            <Text
                                style={[
                                    styles.painText,
                                    form.pain_level === num && styles.painTextSelected,
                                ]}
                            >
                                {num}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </RNView>
            </RNView>

            <RNView style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Mapa de Dolor</Text>
                <BodyMap
                    selectedZones={selectedZones}
                    onZoneSelect={toggleZone}
                />
            </RNView>

            <SOAPInput
                label="Subjetivo (S)"
                placeholder="Lo que el paciente refiere, síntomas, sensaciones..."
                value={form.subjective}
                onChangeText={(txt: string) => setForm({ ...form, subjective: txt })}
            />
            <SOAPInput
                label="Objetivo (O)"
                placeholder="Hallazgos físicos, pruebas, rangos de movimiento..."
                value={form.objective}
                onChangeText={(txt: string) => setForm({ ...form, objective: txt })}
            />
            <SOAPInput
                label="Análisis/Evaluación (A)"
                placeholder="Tu diagnóstico clínico, progresión, razonamiento..."
                value={form.assessment}
                onChangeText={(txt: string) => setForm({ ...form, assessment: txt })}
            />
            <SOAPInput
                label="Plan (P)"
                placeholder="Tratamiento realizado, ejercicios, recomendaciones..."
                value={form.plan}
                onChangeText={(txt: string) => setForm({ ...form, plan: txt })}
            />

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>Guardar Sesión</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

function SOAPInput({ label, placeholder, value, onChangeText }: any) {
    return (
        <RNView style={styles.inputSection}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                textAlignVertical="top"
            />
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
    painSection: {
        marginBottom: 24,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    painGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
    },
    painButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    painButtonSelected: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    painText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    painTextSelected: {
        color: '#fff',
    },
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        color: '#1e293b',
    },
    saveButton: {
        backgroundColor: '#2563eb',
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
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
