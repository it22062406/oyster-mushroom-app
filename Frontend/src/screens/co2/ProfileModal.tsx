import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'

import { COLORS } from '@/constants/co2Colors'
import type { RootStackParamList } from '@/navigation/types'
import { api } from '@/services/co2Api'

type Nav = NativeStackNavigationProp<RootStackParamList, 'Profile'>

export function ProfileModal() {
  const navigation = useNavigation<Nav>()
  const [user, setUser] = useState({ name: 'Farm Administrator', email: '', farmName: 'Oyster Mushroom Farm', isLoggedIn: false })
  const [profileImage, setProfileImageState] = useState('')

  useFocusEffect(
    useCallback(() => {
      setUser(api.getUser())
      api.getProfileImage().then(setProfileImageState)
    }, [])
  )

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) { Alert.alert('Permission needed'); return }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled) {
      const uri = result.assets[0]!.uri
      await api.setProfileImage(uri)
      setProfileImageState(uri)
    }
  }

  const logout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => {
        await api.logout()
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
      }}
    ])
  }

  const switchAccount = () => {
    navigation.goBack()
    navigation.navigate('Login')
  }

  const initials = user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'FA'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#D8EBD0" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Avatar with upload */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.name}>{user.name || 'Farm Administrator'}</Text>
          <Text style={styles.email}>{user.email || ''}</Text>
          <Text style={styles.sub}>{user.farmName || 'Oyster Mushroom Farm'}</Text>
        </View>

        {/* Farm Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>FARM INFO</Text>
          {[
            { label: 'Farm Name', val: user.farmName || 'Oyster Mushroom Farm' },
            { label: 'System', val: 'Online ✅' },
            { label: 'Backend', val: 'FastAPI :8000' },
            { label: 'Project', val: 'R26-ISE-002' },
          ].map((row, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.rowKey}>{row.label}</Text>
              <Text style={styles.rowVal}>{row.val}</Text>
            </View>
          ))}
        </View>

        {/* Switch Account */}
        <TouchableOpacity style={styles.switchBtn} onPress={switchAccount}>
          <Ionicons name="swap-horizontal" size={18} color={COLORS.green} />
          <Text style={styles.switchBtnText}>Switch Account</Text>
        </TouchableOpacity>

        {/* Log Out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.green, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#D8EBD0', fontSize: 18, fontWeight: '600' },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatarImg: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: COLORS.green },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#D8EBD0', fontSize: 28, fontWeight: '600' },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.greenMid, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.card },
  name: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  email: { fontSize: 13, color: COLORS.muted, marginBottom: 4 },
  sub: { fontSize: 12, color: COLORS.muted },
  card: { backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 0.5, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 11, fontWeight: '600', color: COLORS.green, letterSpacing: 0.8, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: COLORS.surface },
  rowKey: { fontSize: 13, color: COLORS.muted },
  rowVal: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  switchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 13, backgroundColor: COLORS.normalBg, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.normal, marginBottom: 10 },
  switchBtnText: { color: COLORS.green, fontSize: 14, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 13, backgroundColor: COLORS.critical, borderRadius: 12, marginBottom: 20 },
  logoutBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
})
