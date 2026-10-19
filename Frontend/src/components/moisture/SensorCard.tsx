import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { MOISTURE_COLORS } from '@/constants/moistureConstants';

interface SensorCardProps {
  title: string;
  value: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export function MoistureSensorCard({
  title,
  value,
  unit,
  icon,
  color = MOISTURE_COLORS.accent,
}: SensorCardProps) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={24} color={color} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>
        {value}
        <Text style={styles.unit}> {unit}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: MOISTURE_COLORS.card,
    borderRadius: 12,
    padding: 16,
    width: '47%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MOISTURE_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    color: MOISTURE_COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
    color: MOISTURE_COLORS.textSecondary,
  },
});
