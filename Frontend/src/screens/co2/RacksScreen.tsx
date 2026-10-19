import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { COLORS, getStressColor, getStressLabel, getStressBg } from '@/constants/co2Colors'
import type { RootStackParamList } from '@/navigation/types'
import { api } from '@/services/co2Api'

type Nav = NativeStackNavigationProp<RootStackParamList>

export function RacksScreen() {
  const navigation = useNavigation<Nav>()
  const [racks, setRacks] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [renameModal, setRenameModal] = useState(false)
  const [renameRackId, setRenameRackId] = useState('')
  const [renameValue, setRenameValue] = useState('')

  const fetchRacks = async () => {
    try {
      const res = await api.getAllRacks()
      setRacks(res.data || [])
    } catch (e) {}
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchRacks()
    const t = setInterval(fetchRacks, 5000)
    return () => clearInterval(t)
  }, [])

  const removeRack = (rackId: string) => {
    Alert.alert(
      '🗑️ Remove Device',
      `Remove ${rackId.toUpperCase()} from system?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.removeRack(rackId)
              setRacks(prev => prev.filter(r => r.rack_id !== rackId))
              Alert.alert('✅ Removed', `${rackId.toUpperCase()} removed`)
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.detail || 'Could not remove')
            }
          }
        }
      ]
    )
  }

  const doRename = async () => {
    if (!renameValue.trim()) return
    try {
      await api.renameRack(renameRackId, renameValue.trim(), '')
      setRenameModal(false)
      fetchRacks()
      Alert.alert('✅ Renamed', `Renamed to ${renameValue.trim()}`)
    } catch (e) {
      Alert.alert('Error', 'Could not rename device')
    }
  }

  const filtered = racks.filter(r => {
    const csi = r.csi || 0
    if (filter === 'all') return true
    if (filter === 'normal') return csi <= 0.30
    if (filter === 'medium') return csi > 0.30 && csi <= 0.60
    if (filter === 'high') return csi > 0.60 && csi <= 0.85
    if (filter === 'critical') return csi > 0.85
    return true
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Racks</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddDevice')}>
          <Ionicons name="add" size={22} color="#D8EBD0" />
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {['all', 'normal', 'medium', 'high', 'critical'].map(f => (
          <TouchableOpacity key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.green} /> : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item.rack_id || i.toString()}
          contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const csi = item.csi || 0
            const color = getStressColor(csi)
            return (
              <TouchableOpacity
                style={[styles.rackRow, { borderLeftColor: color }]}
                onPress={() => navigation.navigate('RackDetail', { id: item.rack_id })}
                onLongPress={() => {
                  setRenameRackId(item.rack_id)
                  setRenameValue(item.display_name || item.rack_id)
                  setRenameModal(true)
                }}
                delayLongPress={600}
              >
                <View style={[styles.dot, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rackName}>{item.display_name || item.rack_id?.toUpperCase()}</Text>
                  <Text style={styles.rackSub}>CO₂: {item.co2 || 400} ppm · CSI: {csi.toFixed(2)}</Text>
                  {item.auto_registered && (
                    <Text style={styles.autoTag}>● Auto-detected</Text>
                  )}
                </View>
                <View style={[styles.stressBadge, { backgroundColor: getStressBg(csi) }]}>
                  <Text style={[styles.stressText, { color }]}>{getStressLabel(csi)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.muted} />
              </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="layers-outline" size={48} color={COLORS.muted} />
              <Text style={styles.emptyText}>No racks found</Text>
              <Text style={styles.emptyHint}>Connect an ESP32 device to auto-detect</Text>
            </View>
          }
          ListFooterComponent={
            racks.length > 0 ? (
              <Text style={styles.hint}>💡 Long press a rack to rename it</Text>
            ) : null
          }
        />
      )}

      <Modal visible={renameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Rename Device</Text>
            <Text style={styles.modalSub}>{renameRackId.toUpperCase()}</Text>
            <TextInput
              style={styles.modalInput}
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Enter display name"
              placeholderTextColor={COLORS.muted}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setRenameModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={doRename}>
                <Text style={styles.modalConfirmText}>Rename</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.green, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#D8EBD0', fontSize: 18, fontWeight: '600' },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', padding: 12, gap: 6, backgroundColor: COLORS.card, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  filterBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: COLORS.surface },
  filterActive: { backgroundColor: COLORS.green },
  filterText: { fontSize: 11, color: COLORS.muted, textTransform: 'capitalize' },
  filterTextActive: { color: '#D8EBD0', fontWeight: '600' },
  rackRow: { backgroundColor: COLORS.card, borderRadius: 12, borderLeftWidth: 3, borderWidth: 0.5, borderColor: COLORS.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rackName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  rackSub: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  autoTag: { fontSize: 10, color: COLORS.green, marginTop: 3, fontWeight: '500' },
  stressBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  stressText: { fontSize: 10, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 40, gap: 8 },
  emptyText: { color: COLORS.muted, fontSize: 15, fontWeight: '500' },
  emptyHint: { color: COLORS.muted, fontSize: 12, opacity: 0.7 },
  hint: { textAlign: 'center', fontSize: 11, color: COLORS.muted, marginTop: 16, opacity: 0.6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, width: '100%' },
  modalTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  modalSub: { fontSize: 12, color: COLORS.muted, marginBottom: 14 },
  modalInput: { backgroundColor: COLORS.surface, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.text, borderWidth: 0.5, borderColor: COLORS.border, marginBottom: 14 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancel: { flex: 1, padding: 11, borderRadius: 10, backgroundColor: COLORS.surface, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border },
  modalCancelText: { color: COLORS.muted, fontSize: 14 },
  modalConfirm: { flex: 1, padding: 11, borderRadius: 10, backgroundColor: COLORS.green, alignItems: 'center' },
  modalConfirmText: { color: '#D8EBD0', fontSize: 14, fontWeight: '600' },
})
