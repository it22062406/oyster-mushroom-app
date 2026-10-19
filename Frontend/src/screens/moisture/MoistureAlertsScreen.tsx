import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

import { MOISTURE_COLORS } from '@/constants/moistureConstants';
import type { RootStackParamList } from '@/navigation/types';
import type { FarmAlert } from '@/services/alertActions';
import { database, ref, onValue, query, orderByKey, limitToLast } from '@/services/moistureFirebase';

type AlertItem = FarmAlert;

const ALERT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  temperature: 'thermometer-outline',
  humidity: 'water-outline',
  tsi: 'pulse-outline',
};

export function MoistureAlertsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const alertsRef = query(ref(database, 'alerts'), orderByKey(), limitToLast(100));

    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data: AlertItem[] = [];
      snapshot.forEach((child) => {
        data.push({
          id: child.key!,
          ...child.val(),
        });
      });
      data.reverse();
      setAlerts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRelativeTime = (timestamp?: number): string => {
    if (!timestamp) return '';
    const diff = Date.now() / 1000 - timestamp;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const renderAlert = ({ item }: { item: AlertItem }) => {
    const isCritical = item.severity === 'critical';
    const severityColor = isCritical ? MOISTURE_COLORS.critical : MOISTURE_COLORS.warning;
    const icon = ALERT_ICONS[item.type] || 'alert-outline';

    return (
      <TouchableOpacity
        style={[styles.alertCard, { borderLeftColor: severityColor }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AlertDetail', item)}
      >
        <View style={styles.alertHeader}>
          <Ionicons name={icon} size={20} color={severityColor} />
          <Text style={[styles.severityBadge, { backgroundColor: severityColor }]}>
            {item.severity.toUpperCase()}
          </Text>
          <Text style={styles.timestamp}>{getRelativeTime(item.timestamp)}</Text>
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={[styles.viewDetail, { color: severityColor }]}>View action needed</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Loading alerts...</Text>
      </View>
    );
  }

  if (alerts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-circle-outline" size={48} color={MOISTURE_COLORS.accent} />
        <Text style={styles.emptyTitle}>All Clear</Text>
        <Text style={styles.emptyText}>No alerts at the moment. Conditions are stable.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={alerts}
      renderItem={renderAlert}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MOISTURE_COLORS.surface,
  },
  listContent: {
    padding: 16,
    paddingTop: 60,
  },
  alertCard: {
    backgroundColor: MOISTURE_COLORS.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: MOISTURE_COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  severityBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  timestamp: {
    color: MOISTURE_COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 'auto',
  },
  message: {
    color: MOISTURE_COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  viewDetail: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: MOISTURE_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingTop: 60,
  },
  emptyTitle: {
    color: MOISTURE_COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: MOISTURE_COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
