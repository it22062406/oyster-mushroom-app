import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'

import { COLORS, getStressColor, getStressLabel } from '@/constants/co2Colors'
import type { RootStackParamList } from '@/navigation/types'
import { api, memStore } from '@/services/co2Api'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

type Nav = NativeStackNavigationProp<RootStackParamList>

export function Co2HomeScreen() {
  const navigation = useNavigation<Nav>()
  const [racks, setRacks] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [intervalVal, setIntervalVal] = useState(10)
  const [userName, setUserName] = useState('Farm Administrator')
  const [farmName, setFarmName] = useState('Oyster Mushroom Farm')
  const [userLoading, setUserLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setUserLoading(true)
        try {
          const user = api.getUser()
          if (user.name && user.name !== '') {
            setUserName(user.name)
            setFarmName(user.farmName)
          }
          const base = memStore.backendUrl || 'http://192.168.100.59:8000'
          const stored = api.getUser()
          if (stored.email) {
            const res = await axios.post(`${base}/auth/login/verify`, {
              email: stored.email
            })
            if (res.data.name) {
              setUserName(res.data.name)
              memStore.userName = res.data.name
            }
          }
        } catch {
          const user = api.getUser()
          setUserName(user.name || 'Farm Administrator')
        } finally {
          setUserLoading(false)
        }
      }
      loadData()
    }, [])
  )

  const fetchData = useCallback(async () => {
    try {
      const [racksRes, alertsRes, iv] = await Promise.all([api.getAllRacks(), api.getAlerts(), api.getSensorInterval()])
      setRacks(racksRes.data || [])
      setAlerts((alertsRes.data || []).slice(0, 5))
      setIntervalVal(iv)
    } catch (e) { console.log('err', e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { fetchData(); const t = setInterval(fetchData, intervalVal * 1000); return () => clearInterval(t) }, [fetchData, intervalVal])

  const activeAlerts = racks.filter(r => (r.csi || 0) > 0.61).length

  if (loading) return <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}><ActivityIndicator size="large" color={COLORS.green}/><Text style={{color:COLORS.muted,marginTop:10}}>Connecting to farm...</Text></View>

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>🍄</Text>
          <View><Text style={styles.headerTitle}>OysterPulse</Text><Text style={styles.headerSub}>CO₂ Stress Monitor</Text></View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.intervalBadge}><Text style={styles.intervalText}>Every {intervalVal < 60 ? `${intervalVal}s` : `${intervalVal/60}m`}</Text></View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}><Ionicons name="notifications-outline" size={20} color="#D8EBD0"/>{activeAlerts > 0 && <View style={styles.badge}/>}</TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}><Ionicons name="person-outline" size={20} color="#D8EBD0"/></TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true);fetchData()}} tintColor={COLORS.green}/>}>
        <View style={styles.welcomeSection}>
          {userLoading ? (
            <ActivityIndicator color={COLORS.green} size="small" />
          ) : (
            <Text style={styles.greeting}>{getGreeting()}, {userName}!</Text>
          )}
          <Text style={styles.farmName}>{farmName}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statBox,{backgroundColor:COLORS.normalBg}]}><Text style={[styles.statLabel,{color:COLORS.normal}]}>Total Racks</Text><Text style={[styles.statVal,{color:COLORS.normal}]}>{racks.length}</Text></View>
          <View style={[styles.statBox,{backgroundColor:activeAlerts>0?COLORS.criticalBg:COLORS.normalBg}]}><Text style={[styles.statLabel,{color:activeAlerts>0?COLORS.critical:COLORS.normal}]}>Active Alerts</Text><Text style={[styles.statVal,{color:activeAlerts>0?COLORS.critical:COLORS.normal}]}>{activeAlerts}</Text></View>
        </View>
        {alerts.length > 0 && <>
          <Text style={styles.sectionLabel}>RECENT ALERTS</Text>
          {alerts.map((alert,i) => (
            <TouchableOpacity key={i} style={[styles.alertItem,{borderLeftColor:getStressColor(alert.csi||0)}]} onPress={()=>navigation.navigate('RackDetail', { id: alert.rack_id })}>
              <Text style={styles.alertRack}>{(alert.rack_id||'').toUpperCase()}</Text>
              <Text style={styles.alertMsg}>{getStressLabel(alert.csi||0)} · CO₂: {alert.co2||0} ppm</Text>
            </TouchableOpacity>
          ))}
        </>}
        <View style={{height:20}}/>
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  header:{backgroundColor:COLORS.green,paddingTop:50,paddingBottom:16,paddingHorizontal:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  headerLeft:{flexDirection:'row',alignItems:'center',gap:10},
  headerIcon:{fontSize:28},
  headerTitle:{color:'#D8EBD0',fontSize:16,fontWeight:'600'},
  headerSub:{color:'rgba(210,235,200,0.6)',fontSize:11},
  headerRight:{flexDirection:'row',alignItems:'center',gap:8},
  iconBtn:{width:34,height:34,borderRadius:9,backgroundColor:'rgba(255,255,255,0.1)',alignItems:'center',justifyContent:'center'},
  badge:{position:'absolute',top:4,right:4,width:8,height:8,borderRadius:4,backgroundColor:COLORS.critical},
  intervalBadge:{backgroundColor:'rgba(255,255,255,0.12)',paddingHorizontal:8,paddingVertical:3,borderRadius:99},
  intervalText:{color:'#D8EBD0',fontSize:10},
  scroll:{flex:1},
  welcomeSection:{paddingHorizontal:14,paddingTop:16,paddingBottom:4},
  greeting:{fontSize:20,fontWeight:'600',color:COLORS.text},
  farmName:{fontSize:13,color:COLORS.muted,marginTop:2},
  statsRow:{flexDirection:'row',gap:10,margin:14},
  statBox:{flex:1,borderRadius:12,padding:14},
  statLabel:{fontSize:11,fontWeight:'500',marginBottom:4},
  statVal:{fontSize:28,fontWeight:'600'},
  sectionLabel:{fontSize:10,color:COLORS.muted,letterSpacing:1.2,textTransform:'uppercase',marginHorizontal:14,marginBottom:8,marginTop:4},
  alertItem:{backgroundColor:COLORS.card,borderRadius:12,borderLeftWidth:3,borderColor:COLORS.border,borderWidth:0.5,padding:12,marginHorizontal:14,marginBottom:8},
  alertRack:{fontSize:12,fontWeight:'600',color:COLORS.text},
  alertMsg:{fontSize:11,color:COLORS.muted,marginTop:2},
})
