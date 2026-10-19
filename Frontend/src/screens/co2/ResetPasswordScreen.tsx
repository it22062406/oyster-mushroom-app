import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import type { RootStackParamList } from '@/navigation/types'
import { api } from '@/services/co2Api'

const BG = '#F2EDE3'
const GREEN = '#2C5F2E'
const INPUT_BG = '#FFFFFF'
const INPUT_BORDER = '#E5DDD0'
const PLACEHOLDER = '#B0A898'
const MUTED = '#8C7B6B'

type Nav = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>

export function ResetPasswordScreen() {
  const navigation = useNavigation<Nav>()
  const [email, setEmail] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const resetPassword = async () => {
    if (!email) { Alert.alert('Error', 'Enter your email'); return }
    if (step === 1) { setStep(2); return }
    if (!newPass || newPass !== confirmPass) { Alert.alert('Error', 'Passwords do not match'); return }
    setLoading(true)
    try {
      await api.resetPassword(email, newPass)
      Alert.alert('✅ Success', 'Password updated! Please login.')
      navigation.navigate('Login')
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Reset failed')
    } finally { setLoading(false) }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.leafTopLeft}>🌿</Text>
      <Text style={styles.leafTopRight}>🌿</Text>
      <Text style={styles.mushroomBottom}>🍄</Text>

      <View style={styles.inner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={GREEN} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.sub}>{step === 1 ? 'Enter your email to reset password' : 'Enter your new password'}</Text>

        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={18} color={PLACEHOLDER} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor={PLACEHOLDER}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={step === 1} />
        </View>

        {step === 2 && (
          <>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={PLACEHOLDER} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="New Password" placeholderTextColor={PLACEHOLDER}
                value={newPass} onChangeText={setNewPass} secureTextEntry={!showNew} />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                <Ionicons name={showNew ? 'eye-outline' : 'eye-off-outline'} size={18} color={PLACEHOLDER} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={PLACEHOLDER} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor={PLACEHOLDER}
                value={confirmPass} onChangeText={setConfirmPass} secureTextEntry={!showConfirm} />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color={PLACEHOLDER} />
              </TouchableOpacity>
            </View>
          </>
        )}

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={resetPassword} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{step === 1 ? 'Continue' : 'Reset Password'}</Text>}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  leafTopLeft: { position: 'absolute', top: 30, left: 10, fontSize: 36, opacity: 0.2, transform: [{ rotate: '-30deg' }], zIndex: 1 },
  leafTopRight: { position: 'absolute', top: 25, right: 10, fontSize: 36, opacity: 0.2, transform: [{ rotate: '30deg' }], zIndex: 1 },
  mushroomBottom: { position: 'absolute', bottom: 20, right: 20, fontSize: 60, opacity: 0.15, zIndex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 32 },
  backText: { fontSize: 15, color: GREEN, fontWeight: '500' },
  title: { fontSize: 28, fontWeight: '700', color: '#1E2B1A', marginBottom: 8 },
  sub: { fontSize: 14, color: MUTED, marginBottom: 24 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: INPUT_BG, borderRadius: 12, borderWidth: 1, borderColor: INPUT_BORDER, marginBottom: 12, paddingHorizontal: 14, height: 55 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#1E2B1A' },
  eyeBtn: { padding: 6 },
  btn: { backgroundColor: GREEN, height: 55, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 20 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 13, color: MUTED },
  loginLink: { fontSize: 13, color: GREEN, fontWeight: '700' },
})
