import React from 'react';
import { StyleSheet, TouchableOpacity, View as RNView, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
    const { user } = useAuth();
    const router = useRouter();

    async function handleSignOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Error', error.message);
        } else {
            router.replace('/(auth)/login');
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <RNView style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.user_metadata?.first_name?.[0] || 'U'}
                    </Text>
                </RNView>
                <Text style={styles.userName}>
                    {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                </Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

            <View style={styles.section}>
                <SettingItem
                    title="Editar Perfil"
                    icon="user-edit"
                    onPress={() => { }}
                />
                <SettingItem
                    title="Seguridad"
                    icon="lock"
                    onPress={() => { }}
                />
                <SettingItem
                    title="Notificaciones"
                    icon="bell"
                    onPress={() => { }}
                />
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <FontAwesome5 name="sign-out-alt" size={20} color="#ef4444" />
                <Text style={styles.signOutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

function SettingItem({ title, icon, onPress }: any) {
    return (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <RNView style={styles.settingIconContent}>
                <FontAwesome5 name={icon} size={18} color="#64748b" />
                <Text style={styles.settingTitle}>{title}</Text>
            </RNView>
            <FontAwesome5 name="chevron-right" size={14} color="#cbd5e1" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginVertical: 40,
        backgroundColor: 'transparent',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    userEmail: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 8,
        marginBottom: 24,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingIconContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingTitle: {
        fontSize: 16,
        color: '#1e293b',
        marginLeft: 12,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        padding: 16,
        borderRadius: 12,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ef4444',
        marginLeft: 10,
    },
});
