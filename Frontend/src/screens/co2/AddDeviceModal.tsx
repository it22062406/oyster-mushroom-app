import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { COLORS } from '@/constants/co2Colors'
import type { RootStackParamList } from '@/navigation/types'
import { api } from '@/services/co2Api'

const SENSOR_TYPES = ['MQ-2 (relative CO₂)', 'MH-Z19B (accurate CO₂)']
const GROWTH_STAGES = ['Pinning', 'Early Growth', 'Fruiting', 'Maturity']

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddDevice'>

export function AddDeviceModal() {
  const navigation = useNavigation<Nav>()
  const [rackId, setRackId] = useState('')
  const [location, setLocation] = useState('')
  const [sensorType, setSensorType] = useState(0)
  const [growthStage, setGrowthStage] = useState(0)
  const [loading, setLoading] = useState(false)

  const addDevice = async () => {
    if (!rackId.trim()) { Alert.alert('Error', 'Rack ID is required'); return }
    setLoading(true)
    try {
      await api.addRack({
        rack_id: rackId.trim().toLowerCase(),
        location: location || 'Unknown',
        sensor_type: SENSOR_TYPES[sensorType],
        growth_stage: GROWTH_STAGES[growthStage],
      })
      Alert.alert('✅ Added', `${rackId} added successfully!`)
      navigation.goBack()
    } catch (e) {
      Alert.alert('Error', 'Could not add device. Check backend connection.')
    } finally { setLoading(false) }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add New IoT Device</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#D8EBD0" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>DEVICE INFO</Text>
          <Text style={styles.label}>Rack ID *</Text>
          <TextInput style={styles.input} placeholder="e.g. rack_05" value={rackId}
            onChangeText={setRackId} autoCapitalize="none" placeholderTextColor={COLORS.muted} />
          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} placeholder="e.g. Row 2, Shelf A" value={location}
            onChangeText={setLocation} placeholderTextColor={COLORS.muted} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>SENSOR TYPE</Text>
          {SENSOR_TYPES.map((t, i) => (
            <TouchableOpacity key={i} style={[styles.optionRow, sensorType === i && styles.optionActive]}
              onPress={() => setSensorType(i)}>
              <View style={[styles.radio, sensorType === i && styles.radioActive]} />
              <Text style={[styles.optionText, sensorType === i && { color: COLORS.green }]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>GROWTH STAGE</Text>
          {GROWTH_STAGES.map((s, i) => (
            <TouchableOpacity key={i} style={[styles.optionRow, growthStage === i && styles.optionActive]}
              onPress={() => setGrowthStage(i)}>
              <View style={[styles.radio, growthStage === i && styles.radioActive]} />
              <Text style={[styles.optionText, growthStage === i && { color: COLORS.green }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.addBtn, loading && { opacity: 0.7 }]} onPress={addDevice} disabled={loading}>
          {loading ? <ActivityIndicator color="#D8EBD0" /> : <Ionicons name="add-circle" size={20} color="#D8EBD0" />}
          <Text style={styles.addBtnText}>{loading ? 'Adding...' : 'Add Device'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.green, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#D8EBD0', fontSize: 18, fontWeight: '600' },
  card: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 0.5, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 11, fontWeight: '600', color: COLORS.green, letterSpacing: 0.8, marginBottom: 12 },
  label: { fontSize: 12, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: COLORS.surface, borderRadius: 9, padding: 11, fontSize: 14, color: COLORS.text, borderWidth: 0.5, borderColor: COLORS.border },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 9, marginBottom: 4 },
  optionActive: { backgroundColor: COLORS.normalBg },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.border },
  radioActive: { borderColor: COLORS.green, backgroundColor: COLORS.green },
  optionText: { fontSize: 13, color: COLORS.text },
  addBtn: { backgroundColor: COLORS.green, padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 },
  addBtnText: { color: '#D8EBD0', fontSize: 15, fontWeight: '600' },
  cancelBtn: { padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border },
  cancelBtnText: { color: COLORS.muted, fontSize: 14 },
})
