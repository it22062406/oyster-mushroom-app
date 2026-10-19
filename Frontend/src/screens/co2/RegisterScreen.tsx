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

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>

export function RegisterScreen() {
  const navigation = useNavigation<Nav>()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const register = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }
    if (password !== confirmPass) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }
    if (!agreed) {
      Alert.alert('Error', 'Please agree to Terms & Conditions')
      return
    }
    setLoading(true)
    try {
      const res = await api.register({ name, email, phone, password })
      Alert.alert(
        '✅ Account Created!',
        `Welcome ${res.data.name}! Please login to continue.`,
        [{ text: 'Login Now', onPress: () => navigation.navigate('Login') }]
      )
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || e.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.leafTopLeft}>🌿</Text>
      <Text style={styles.leafTopRight}>🌿</Text>
      <Text style={styles.mushroomBottom}>🍄</Text>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topSection}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.sub}>
            Join and manage your{' '}
            <Text style={styles.subBold}>oyster mushroom</Text>
            {'\n'}farm smartly.
          </Text>
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="person-outline" size={18} color={PLACEHOLDER} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={PLACEHOLDER}
            value={name} onChangeText={setName} />
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={18} color={PLACEHOLDER} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor={PLACEHOLDER}
            value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="call-outline" size={18} color={PLACEHOLDER} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={PLACEHOLDER}
            value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color={PLACEHOLDER} style={styles.inputIcon} />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor={PLACEHOLDER}
            value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={18} color={PLACEHOLDER} />
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

        <TouchableOpacity style={styles.checkRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <Text style={styles.checkText}>
            I agree to the <Text style={styles.link}>Terms & Conditions</Text> and <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={register} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60 },
  leafTopLeft: { position: 'absolute', top: 30, left: 10, fontSize: 36, opacity: 0.2, transform: [{ rotate: '-30deg' }], zIndex: 1 },
  leafTopRight: { position: 'absolute', top: 25, right: 10, fontSize: 36, opacity: 0.2, transform: [{ rotate: '30deg' }], zIndex: 1 },
  mushroomBottom: { position: 'absolute', bottom: 20, right: 20, fontSize: 60, opacity: 0.15, zIndex: 1 },
  topSection: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '700', color: GREEN, marginBottom: 8 },
  sub: { fontSize: 14, color: MUTED, textAlign: 'center', lineHeight: 21 },
  subBold: { fontWeight: '700', color: GREEN },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: INPUT_BG, borderRadius: 12, borderWidth: 1, borderColor: INPUT_BORDER, marginBottom: 12, paddingHorizontal: 14, height: 55 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#1E2B1A' },
  eyeBtn: { padding: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4, marginBottom: 20 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: INPUT_BORDER, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxActive: { backgroundColor: GREEN, borderColor: GREEN },
  checkText: { flex: 1, fontSize: 13, color: MUTED, lineHeight: 19 },
  link: { color: GREEN, fontWeight: '600', textDecorationLine: 'underline' },
  btn: { backgroundColor: GREEN, height: 55, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  btnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 13, color: MUTED },
  loginLink: { fontSize: 13, color: GREEN, fontWeight: '700' },
})
