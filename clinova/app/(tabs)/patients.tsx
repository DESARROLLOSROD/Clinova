import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    View as RNView,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { supabase } from '../../lib/supabase';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PatientsScreen() {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchPatients();
    }, []);

    async function fetchPatients() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .order('first_name', { ascending: true });

            if (error) throw error;
            setPatients(data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const filteredPatients = patients.filter((p) => {
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
    });

    const onRefresh = () => {
        setRefreshing(true);
        fetchPatients();
    };

    const renderPatient = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.patientCard}
            onPress={() => router.push({ pathname: '/patient-detail', params: { id: item.id } })}
        >
            <RNView style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{item.first_name[0]}{item.last_name[0]}</Text>
            </RNView>
            <RNView style={styles.patientInfo}>
                <Text style={styles.patientName}>{item.first_name} {item.last_name}</Text>
                <Text style={styles.patientSub}>{item.email || 'Sin correo'}</Text>
            </RNView>
            <FontAwesome5 name="chevron-right" size={14} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <RNView style={styles.searchInputWrapper}>
                    <FontAwesome5 name="search" size={16} color="#64748b" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#94a3b8"
                    />
                </RNView>
                <TouchableOpacity style={styles.addButton}>
                    <FontAwesome5 name="plus" size={16} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <RNView style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#2563eb" />
                </RNView>
            ) : (
                <FlatList
                    data={filteredPatients}
                    renderItem={renderPatient}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListEmptyComponent={
                        <RNView style={styles.emptyContainer}>
                            <FontAwesome5 name="users-slash" size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No se encontraron pacientes</Text>
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
    searchContainer: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: 'transparent',
    },
    searchInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    patientCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#4338ca',
        fontWeight: 'bold',
        fontSize: 16,
    },
    patientInfo: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    patientName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    patientSub: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
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
