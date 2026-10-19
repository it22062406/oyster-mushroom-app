import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { COLORS, getStressColor, getStressLabel } from '@/constants/co2Colors'
import type { RootStackParamList } from '@/navigation/types'
import { api } from '@/services/co2Api'

type Nav = NativeStackNavigationProp<RootStackParamList, 'Notifications'>

export function NotificationsModal() {
  const navigation = useNavigation<Nav>()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAlerts().then(r => setAlerts(r.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#D8EBD0" />
        </TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.green} /> : (
        <FlatList
          data={alerts}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 14 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.muted} />
              <Text style={styles.emptyText}>No alerts yet</Text>
            </View>
          }
          renderItem={({ item }) => {
            const csi = item.csi || 0
            const color = getStressColor(csi)
            return (
              <TouchableOpacity style={[styles.alertItem, { borderLeftColor: color }]}
                onPress={() => { navigation.goBack(); navigation.navigate('RackDetail', { id: item.rack_id }) }}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertRack}>{(item.rack_id || '').toUpperCase()} — {getStressLabel(csi)}</Text>
                  <Text style={styles.alertMsg}>CO₂: {item.co2 || 0} ppm · CSI: {csi.toFixed(2)}</Text>
                  <Text style={styles.alertTime}>{item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '—'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
              </TouchableOpacity>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.green, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#D8EBD0', fontSize: 18, fontWeight: '600' },
  alertItem: { backgroundColor: COLORS.card, borderRadius: 12, borderLeftWidth: 3, borderWidth: 0.5, borderColor: COLORS.border, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  alertRack: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  alertMsg: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  alertTime: { fontSize: 10, color: COLORS.muted, marginTop: 3, opacity: 0.7 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
})
