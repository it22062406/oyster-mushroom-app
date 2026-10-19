import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import type { RootStackParamList } from '@/navigation/types'
import { api } from '@/services/co2Api'

const BG = '#F2EDE3'
const GREEN = '#2C5F2E'
const INPUT_BG = '#FFFFFF'
const INPUT_BORDER = '#E5DDD0'
const PLACEHOLDER = '#B0A898'
const MUTED = '#8C7B6B'

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>

export function LoginScreen() {
  const navigation = useNavigation<Nav>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const login = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return }
    setLoading(true)
    try {
      await api.login(email, password)
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
    } catch (e: any) {
      Alert.alert('Login Failed', e.response?.data?.detail || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.leafTopLeft}>🌿</Text>
      <Text style={styles.leafTopRight}>🌿</Text>
      <Text style={styles.mushroomBottomLeft}>🍄</Text>
      <Text style={styles.mushroomBottomRight}>🍄</Text>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topSection}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoIcon}>🍄</Text>
          </View>
          <Text style={styles.appName}>OysterPulse</Text>
          <Text style={styles.appSub}>Sign in to your farm account</Text>
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={18} color={PLACEHOLDER} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor={PLACEHOLDER}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color={PLACEHOLDER} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor={PLACEHOLDER}
            value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color={PLACEHOLDER} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')} style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={login} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  leafTopLeft: { position: 'absolute', top: 30, left: 10, fontSize: 36, opacity: 0.2, transform: [{ rotate: '-30deg' }], zIndex: 1 },
  leafTopRight: { position: 'absolute', top: 25, right: 10, fontSize: 36, opacity: 0.2, transform: [{ rotate: '30deg' }], zIndex: 1 },
  mushroomBottomLeft: { position: 'absolute', bottom: 30, left: 20, fontSize: 44, opacity: 0.12, transform: [{ rotate: '-15deg' }], zIndex: 1 },
  mushroomBottomRight: { position: 'absolute', bottom: 20, right: 20, fontSize: 52, opacity: 0.15, zIndex: 1 },
  topSection: { alignItems: 'center', marginBottom: 36 },
  logoWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  logoIcon: { fontSize: 30 },
  appName: { fontSize: 26, fontWeight: '700', color: GREEN, marginBottom: 6 },
  appSub: { fontSize: 14, color: MUTED, textAlign: 'center' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: INPUT_BG, borderRadius: 12, borderWidth: 1, borderColor: INPUT_BORDER, marginBottom: 12, paddingHorizontal: 14, height: 55 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#1E2B1A' },
  eyeBtn: { padding: 6 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 13, color: GREEN, fontWeight: '600' },
  btn: { backgroundColor: GREEN, height: 55, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { fontSize: 13, color: MUTED },
  registerLink: { fontSize: 13, color: GREEN, fontWeight: '700' },
})
