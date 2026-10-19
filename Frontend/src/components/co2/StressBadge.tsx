import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { getStressColor, getStressBg, getStressLabel } from '@/constants/co2Colors'
export default function StressBadge({ csi }: { csi: number }) {
  return <View style={[styles.badge, { backgroundColor: getStressBg(csi) }]}><Text style={[styles.text, { color: getStressColor(csi) }]}>{getStressLabel(csi)}</Text></View>
}
const styles = StyleSheet.create({ badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 }, text: { fontSize: 11, fontWeight: '600' } })
