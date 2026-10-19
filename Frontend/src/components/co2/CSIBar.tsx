import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS, getStressColor } from '@/constants/co2Colors'
export default function CSIBar({ csi }: { csi: number }) {
  const pct = Math.round(csi * 100); const color = getStressColor(csi)
  return <View style={styles.wrap}><View style={styles.labelRow}><Text style={styles.label}>CO₂ Stress Index</Text><Text style={[styles.pct, { color }]}>{pct}%</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} /></View></View>
}
const styles = StyleSheet.create({ wrap: { marginBottom: 12 }, labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }, label: { fontSize: 11, color: COLORS.muted }, pct: { fontSize: 11, fontWeight: '600' }, track: { height: 6, backgroundColor: COLORS.border, borderRadius: 99, overflow: 'hidden' }, fill: { height: '100%', borderRadius: 99 } })
