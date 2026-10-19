import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LineChart } from 'react-native-chart-kit'

import { COLORS, getStressColor, getStressBg, getStressAction } from '@/constants/co2Colors'
import type { RootStackParamList } from '@/navigation/types'
import { api } from '@/services/co2Api'
import MetricBox from '@/components/co2/MetricBox'
import CSIBar from '@/components/co2/CSIBar'
import StressBadge from '@/components/co2/StressBadge'

const W = Dimensions.get('window').width

type Rt = RouteProp<RootStackParamList, 'RackDetail'>
type Nav = NativeStackNavigationProp<RootStackParamList, 'RackDetail'>

export function RackDetailScreen() {
  const { params: { id } } = useRoute<Rt>()
  const navigation = useNavigation<Nav>()
  const [rack, setRack] = useState<any>(null)
  const [chartData, setChartData] = useState<number[]>([400,400,400,400,400,400,400,400,400,400])
  const [chartLabels, setChartLabels] = useState<string[]>(Array(10).fill('--'))
  const [loading, setLoading] = useState(true)
  const [showStressPopup, setShowStressPopup] = useState(false)
  const popupShownRef = useRef(false)
  const lastCo2Ref = useRef(0)
  const fetchRack = useCallback(async () => {
    try {
      const res = await api.getAllRacks()
      const found = (res.data||[]).find((r:any)=>r.rack_id===id)
      if(found){
        setRack(found)
        setChartData(prev=>[...prev.slice(1),found.co2||400])
        const now = new Date()
        const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`
        setChartLabels(prev => [...prev.slice(1), timeLabel])
        const currentCo2 = found.co2 || 0
        const currentCsi = found.csi || 0
        if (currentCo2 < 900 && currentCsi < 0.30) {
          popupShownRef.current = false
        }
        if ((currentCo2 > 900 || currentCsi > 0.61) && !popupShownRef.current) {
          popupShownRef.current = true
          setShowStressPopup(true)
        }
        lastCo2Ref.current = currentCo2
      }
    } catch(e){} finally{setLoading(false)}
  },[id])
  useEffect(()=>{ fetchRack(); const t=setInterval(fetchRack,5000); return ()=>clearInterval(t) },[fetchRack])
  if(loading) return <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}><ActivityIndicator color={COLORS.green}/></View>
  if(!rack) return <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}><Text style={{color:COLORS.muted}}>Rack not found</Text></View>
  const csi = rack.csi||0; const color = getStressColor(csi)
  const temp = rack.temperature ?? rack.temp ?? 0
  const hum = rack.humidity ?? rack.hum ?? 0
  return (
    <View style={styles.container}>
      <View style={[styles.header,{backgroundColor:COLORS.green}]}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="rgba(210,235,200,0.7)"/>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{rack?.display_name || id?.toUpperCase()}</Text>
        <StressBadge csi={csi}/>
        {rack.online === false && (
          <View style={{ backgroundColor: 'rgba(255,200,50,0.2)', padding: 7, borderRadius: 8, marginTop: 6 }}>
            <Text style={{ color: '#C49A00', fontSize: 12, textAlign: 'center' }}>
              ⚠️ Device offline · Last seen {
                (rack.last_seen_seconds || 0) > 60
                  ? `${Math.floor((rack.last_seen_seconds||0)/60)}m ago`
                  : `${rack.last_seen_seconds || 0}s ago`
              }
            </Text>
          </View>
        )}
      </View>
      <ScrollView contentContainerStyle={{padding:14}}>
        <View style={styles.metricsRow}>
          <MetricBox label="CO₂" value={rack.co2||400} unit="ppm" color={color}/>
          <MetricBox label="CSI" value={csi.toFixed(2)} unit="/1.0" color={color}/>
          <MetricBox label="Temp" value={temp.toFixed(1)} unit="°C" color={COLORS.blue}/>
          <MetricBox label="Humidity" value={hum.toFixed(1)} unit="%" color={COLORS.teal}/>
        </View>
        <View style={styles.card}>
          <CSIBar csi={csi}/>
          <View style={[styles.actionBox,{backgroundColor:getStressBg(csi)}]}>
            <Text style={[styles.actionText,{color}]}>{getStressAction(csi)}</Text>
          </View>
          <View style={styles.mlBox}>
            <Text style={styles.mlLabel}>CO₂ Stress Detection Model</Text>
            <Text style={[styles.mlVal,{color:COLORS.blue}]}>▶ {rack.ml_prediction||getStressAction(csi).split(' ')[0]}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>CO₂ Trend</Text>
            <Text style={styles.liveLabel}>● LIVE</Text>
          </View>
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [{
                data: chartData,
                color: (opacity = 1) => {
                  const latest = chartData[chartData.length - 1] ?? 400
                  return latest > 1200 ? `rgba(139,26,26,${opacity})`
                       : latest > 900 ? `rgba(139,106,0,${opacity})`
                       : `rgba(45,107,45,${opacity})`
                },
                strokeWidth: 2,
              }]
            }}
            width={W - 48}
            height={200}
            yAxisSuffix=" p"
            chartConfig={{
              backgroundColor: COLORS.card,
              backgroundGradientFrom: COLORS.card,
              backgroundGradientTo: COLORS.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(45,90,39,${opacity})`,
              labelColor: () => COLORS.muted,
              propsForDots: { r: '3', strokeWidth: '1', stroke: color },
              propsForBackgroundLines: { stroke: COLORS.border, strokeDasharray: '3' },
              propsForLabels: { fontSize: 9 },
            }}
            bezier
            style={{ borderRadius: 10, marginLeft: -8 }}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            segments={5}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>📸 Image Validation</Text>
          <TouchableOpacity style={styles.captureManualBtn} onPress={() => navigation.navigate('Co2Monitoring', { screen: 'Co2Capture' })}>
            <Ionicons name="camera" size={18} color={COLORS.green} />
            <Text style={styles.captureManualText}>Manual Image Check</Text>
          </TouchableOpacity>
          {csi > 0.61 && (
            <View style={styles.stressAlert}>
              <Ionicons name="warning" size={16} color={COLORS.high} />
              <Text style={styles.stressAlertText}>
                High stress detected! Capture image to confirm.
              </Text>
              <TouchableOpacity style={styles.captureNowBtn} onPress={() => navigation.navigate('Co2Monitoring', { screen: 'Co2Capture' })}>
                <Text style={styles.captureNowText}>Capture Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={{height:20}}/>
      </ScrollView>
      <Modal visible={showStressPopup} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popup}>
            <Text style={styles.popupIcon}>🚨</Text>
            <Text style={styles.popupTitle}>High Stress Detected!</Text>
            <Text style={styles.popupRack}>{id?.toUpperCase()}</Text>
            <Text style={styles.popupMsg}>CO₂ stress level is HIGH. Capture an image to visually confirm stress.</Text>
            <TouchableOpacity style={styles.popupCapture} onPress={() => { setShowStressPopup(false); navigation.navigate('Co2Monitoring', { screen: 'Co2Capture' }) }}>
              <Text style={styles.popupCaptureText}>📸 Capture Image Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.popupDismiss} onPress={() => setShowStressPopup(false)}>
              <Text style={styles.popupDismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  header:{paddingTop:50,paddingBottom:16,paddingHorizontal:16,gap:4},
  backBtn:{flexDirection:'row',alignItems:'center',gap:4,marginBottom:8},
  backText:{color:'rgba(210,235,200,0.7)',fontSize:13},
  headerTitle:{color:'#D8EBD0',fontSize:22,fontWeight:'600'},
  metricsRow:{flexDirection:'row',gap:8,marginBottom:12},
  card:{backgroundColor:COLORS.card,borderRadius:14,borderWidth:0.5,borderColor:COLORS.border,padding:14,marginBottom:12},
  actionBox:{padding:10,borderRadius:9,marginBottom:8},
  actionText:{fontSize:13,fontWeight:'500'},
  mlBox:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:9,backgroundColor:'#EBF3FC',borderRadius:9},
  mlLabel:{fontSize:12,color:'#1A5F8A'},
  mlVal:{fontSize:12,fontWeight:'600'},
  chartHeader:{flexDirection:'row',justifyContent:'space-between',marginBottom:10},
  chartTitle:{fontSize:13,color:COLORS.muted},
  liveLabel:{fontSize:11,color:COLORS.normal,fontWeight:'600'},
  cardSectionTitle:{fontSize:13,fontWeight:'600',color:COLORS.text,marginBottom:10},
  captureManualBtn:{flexDirection:'row',alignItems:'center',gap:8,padding:12,backgroundColor:COLORS.normalBg,borderRadius:10,borderWidth:0.5,borderColor:COLORS.normal,marginBottom:8},
  captureManualText:{fontSize:13,color:COLORS.green,fontWeight:'500'},
  stressAlert:{padding:12,backgroundColor:COLORS.highBg,borderRadius:10,borderWidth:0.5,borderColor:COLORS.high,gap:8},
  stressAlertText:{fontSize:12,color:COLORS.high},
  captureNowBtn:{backgroundColor:COLORS.high,padding:8,borderRadius:8,alignItems:'center'},
  captureNowText:{color:'#fff',fontSize:12,fontWeight:'600'},
  popupOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center',padding:24},
  popup:{backgroundColor:COLORS.card,borderRadius:16,padding:24,width:'100%',alignItems:'center'},
  popupIcon:{fontSize:40,marginBottom:8},
  popupTitle:{fontSize:18,fontWeight:'700',color:COLORS.high,marginBottom:4},
  popupRack:{fontSize:14,color:COLORS.muted,marginBottom:12},
  popupMsg:{fontSize:13,color:COLORS.text,textAlign:'center',marginBottom:16,lineHeight:20},
  popupCapture:{backgroundColor:COLORS.green,padding:13,borderRadius:11,flexDirection:'row',alignItems:'center',gap:8,width:'100%',justifyContent:'center',marginBottom:8},
  popupCaptureText:{color:'#D8EBD0',fontSize:14,fontWeight:'600'},
  popupDismiss:{padding:10,width:'100%',alignItems:'center'},
  popupDismissText:{color:COLORS.muted,fontSize:13},
})
