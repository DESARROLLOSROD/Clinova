import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { Text } from './Themed';

const { width } = Dimensions.get('window');
const MAP_WIDTH = width - 80;
const MAP_HEIGHT = MAP_WIDTH * 1.5;

interface BodyMapProps {
    onZoneSelect: (zoneId: string) => void;
    selectedZones: string[];
}

export default function BodyMap({ onZoneSelect, selectedZones }: BodyMapProps) {
    const isSelected = (id: string) => selectedZones.includes(id);

    const zones = [
        { id: 'cabeza', d: "M75 10 C85 10, 95 20, 95 35 C95 50, 85 60, 75 60 C65 60, 55 50, 55 35 C55 20, 65 10, 75 10 Z" },
        { id: 'cuello', d: "M68 60 H82 V70 H68 Z" },
        { id: 'torso', d: "M55 70 H95 L100 150 H50 Z" },
        { id: 'hombro_d', d: "M100 75 Q115 75, 120 90 L110 100 Q105 85, 100 85 Z" },
        { id: 'hombro_i', d: "M50 75 Q35 75, 30 90 L40 100 Q45 85, 50 85 Z" },
        { id: 'brazo_d', d: "M110 100 L130 150 L120 160 L100 110 Z" },
        { id: 'brazo_i', d: "M40 100 L20 150 L30 160 L50 110 Z" },
        { id: 'mano_d', d: "M130 150 L140 170 L130 180 L120 160 Z" },
        { id: 'mano_i', d: "M20 150 L10 170 L20 180 L30 160 Z" },
        { id: 'pelvis', d: "M50 150 H100 L110 180 H40 Z" },
        { id: 'pierna_d', d: "M75 180 H105 L115 280 H85 Z" },
        { id: 'pierna_i', d: "M45 180 H75 L65 280 H35 Z" },
        { id: 'pie_d', d: "M85 280 L115 280 L120 300 H85 Z" },
        { id: 'pie_i', d: "M35 280 L65 280 L60 300 H35 Z" },
    ];

    return (
        <View style={styles.container}>
            <Svg
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                viewBox="0 0 150 320"
            >
                <G>
                    {zones.map((zone) => (
                        <Path
                            key={zone.id}
                            d={zone.d}
                            fill={isSelected(zone.id) ? '#ef4444' : '#e2e8f0'}
                            stroke={isSelected(zone.id) ? '#b91c1c' : '#94a3b8'}
                            strokeWidth="1"
                            onPress={() => onZoneSelect(zone.id)}
                        />
                    ))}
                </G>
            </Svg>
            <View style={styles.legend}>
                <Text style={styles.legendText}>
                    Toca las zonas para marcar el dolor
                </Text>
                <View style={styles.selectedContainer}>
                    {selectedZones.length > 0 ? (
                        <Text style={styles.selectedText}>
                            Zonas: {selectedZones.map(z => z.replace('_', ' ')).join(', ')}
                        </Text>
                    ) : (
                        <Text style={styles.noneText}>Ninguna zona seleccionada</Text>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginVertical: 10,
    },
    legend: {
        marginTop: 15,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    legendText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    selectedContainer: {
        marginTop: 8,
        paddingHorizontal: 12,
        backgroundColor: 'transparent',
    },
    selectedText: {
        fontSize: 13,
        color: '#ef4444',
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    noneText: {
        fontSize: 12,
        color: '#94a3b8',
        fontStyle: 'italic',
    }
});
