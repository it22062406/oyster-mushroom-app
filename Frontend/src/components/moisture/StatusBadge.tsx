import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { MOISTURE_COLORS, TSI_STATUS_COLORS } from '@/constants/moistureConstants';

interface StatusBadgeProps {
  status: string;
  tsi: number;
}

export function MoistureStatusBadge({ status, tsi }: StatusBadgeProps) {
  const statusColor = TSI_STATUS_COLORS[status] || MOISTURE_COLORS.textSecondary;

  return (
    <View style={[styles.container, { borderColor: statusColor }]}>
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <View style={styles.textContainer}>
        <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
        <Text style={styles.tsiLabel}>TSI: {tsi}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: MOISTURE_COLORS.card,
    borderRadius: 12,
    padding: 16,
    width: '47%',
    marginBottom: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  status: {
    fontSize: 18,
    fontWeight: '700',
  },
  tsiLabel: {
    color: MOISTURE_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
