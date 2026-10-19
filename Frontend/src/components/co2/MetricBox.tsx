import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS } from '@/constants/co2Colors'
interface Props { label: string; value: string | number; unit: string; color?: string }
export default function MetricBox({ label, value, unit, color = COLORS.text }: Props) {
  return <View style={styles.box}><Text style={styles.label}>{label}</Text><Text style={[styles.value, { color }]}>{value}</Text><Text style={styles.unit}>{unit}</Text></View>
}
const styles = StyleSheet.create({ box: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 10, padding: 10 }, label: { fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }, value: { fontSize: 22, fontWeight: '500', lineHeight: 26 }, unit: { fontSize: 10, color: COLORS.muted, marginTop: 2 } })
