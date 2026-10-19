import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MOISTURE_COLORS } from '@/constants/moistureConstants';
import type { RootStackParamList } from '@/navigation/types';
import { actionForAlert } from '@/services/alertActions';

type Route = RouteProp<RootStackParamList, 'AlertDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'AlertDetail'>;

function formatWhen(timestamp?: number): string {
  if (!timestamp) return 'Time not recorded';
  return new Date(timestamp * 1000).toLocaleString();
}

export function AlertDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params: alert } = useRoute<Route>();
  const action = actionForAlert(alert);
  const isCritical = alert.severity === 'critical';
  const color = isCritical ? MOISTURE_COLORS.critical : MOISTURE_COLORS.warning;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={MOISTURE_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert detail</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{alert.severity.toUpperCase()}</Text>
        </View>
        <Text style={styles.message}>{alert.message}</Text>
        <Text style={styles.when}>{formatWhen(alert.timestamp)}</Text>

        <View style={styles.card}>
          <Row label="Type" value={alert.type === 'tsi' ? 'Temperature stress' : alert.type} />
          <Row label="Reading" value={alert.value === undefined ? '—' : String(alert.value)} />
          <Row label="Limit" value={alert.threshold === undefined ? '—' : String(alert.threshold)} />
        </View>

        <Text style={styles.section}>Action needed</Text>
        <View style={styles.card}>
          <Text style={styles.actionTitle}>{action.title}</Text>
          {action.steps.map((step, index) => (
            <View key={step} style={styles.step}>
              <Text style={[styles.stepNum, { color }]}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MOISTURE_COLORS.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MOISTURE_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MOISTURE_COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: MOISTURE_COLORS.text },
  content: { padding: 16, paddingBottom: 40 },
  badge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  message: { marginTop: 14, fontSize: 18, lineHeight: 26, fontWeight: '600', color: MOISTURE_COLORS.text },
  when: { marginTop: 6, color: MOISTURE_COLORS.textSecondary, fontSize: 13 },
  section: { marginTop: 22, marginBottom: 8, fontSize: 16, fontWeight: '700', color: MOISTURE_COLORS.text },
  card: {
    marginTop: 16,
    backgroundColor: MOISTURE_COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MOISTURE_COLORS.border,
    padding: 14,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { color: MOISTURE_COLORS.textSecondary, fontSize: 14 },
  rowValue: { color: MOISTURE_COLORS.text, fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  actionTitle: { fontSize: 16, fontWeight: '700', color: MOISTURE_COLORS.text, marginBottom: 10 },
  step: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  stepNum: { fontSize: 16, fontWeight: '700', width: 18 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20, color: MOISTURE_COLORS.text },
});
