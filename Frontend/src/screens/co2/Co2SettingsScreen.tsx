import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'

import { COLORS } from '@/constants/co2Colors'
import { api } from '@/services/co2Api'

const PRESETS = [{label:'5s',value:5},{label:'10s',value:10},{label:'30s',value:30},{label:'1min',value:60},{label:'5min',value:300},{label:'10min',value:600}]

export function Co2SettingsScreen() {
  const [s, setS] = useState({backendUrl:'http://192.168.100.59:8000',sensorInterval:10,co2Warning:900,co2Critical:1200,humidityWarning:85,tempWarning:28})
  const [stages, setStages] = useState({pinning:1000,earlyGrowth:1200,fruiting:1000,maturity:1100})
  useEffect(()=>{api.getSettings().then(v=>setS(v)).catch(()=>{})},[])
  const upd = (k:string,v:any) => setS(p=>({...p,[k]:v}))
  const updStage = (k:string,v:string) => setStages(p=>({...p,[k]:parseInt(v)||0}))
  const save = async () => { try{await api.saveSettings(s);Alert.alert('✅ Saved','Settings updated')}catch(e){Alert.alert('Error','Could not save')} }
  const isDemoMode = s.sensorInterval < 60
  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Settings</Text></View>
      <ScrollView contentContainerStyle={{padding:14,paddingBottom:40}}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SENSOR READING INTERVAL</Text>
          <View style={styles.presets}>
            {PRESETS.map(p=>(
              <TouchableOpacity key={p.value} style={[styles.preset,s.sensorInterval===p.value&&styles.presetActive]} onPress={()=>upd('sensorInterval',p.value)}>
                <Text style={[styles.presetText,s.sensorInterval===p.value&&styles.presetTextActive]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customRow}>
            <Text style={styles.customLabel}>Custom (seconds):</Text>
            <TextInput style={styles.customInput} keyboardType="numeric" value={String(s.sensorInterval)} onChangeText={v=>upd('sensorInterval',parseInt(v)||5)}/>
          </View>
          <View style={[styles.modeBadge,{backgroundColor:isDemoMode?COLORS.highBg:COLORS.normalBg}]}>
            <Text style={[styles.modeText,{color:isDemoMode?COLORS.high:COLORS.normal}]}>{isDemoMode?'🟠 Demo mode':'🟢 Production mode'}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CO₂ ALERT THRESHOLDS</Text>
          {[{label:'Warning level',key:'co2Warning',unit:'ppm',color:COLORS.medium},{label:'Critical level',key:'co2Critical',unit:'ppm',color:COLORS.critical}].map(row=>(
            <View key={row.key} style={styles.threshRow}>
              <View style={styles.threshTop}>
                <Text style={styles.threshLabel}>{row.label}</Text>
                <View style={styles.threshInputWrap}>
                  <TextInput style={[styles.threshInput,{color:row.color}]} keyboardType="numeric" value={String(s[row.key as keyof typeof s])} onChangeText={v=>upd(row.key,parseInt(v)||0)}/>
                  <Text style={styles.threshUnit}>{row.unit}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ENVIRONMENT THRESHOLDS</Text>
          {[{label:'Humidity warning',key:'humidityWarning',unit:'%'},{label:'Temperature warning',key:'tempWarning',unit:'°C'}].map(row=>(
            <View key={row.key} style={styles.threshRow}>
              <View style={styles.threshTop}>
                <Text style={styles.threshLabel}>{row.label}</Text>
                <View style={styles.threshInputWrap}>
                  <TextInput style={[styles.threshInput,{color:COLORS.text}]} keyboardType="numeric" value={String(s[row.key as keyof typeof s])} onChangeText={v=>upd(row.key,parseInt(v)||0)}/>
                  <Text style={styles.threshUnit}>{row.unit}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GROWTH STAGE CO₂ LIMITS</Text>
          {[{label:'Pinning stage',key:'pinning'},{label:'Early growth',key:'earlyGrowth'},{label:'Fruiting',key:'fruiting'},{label:'Maturity',key:'maturity'}].map(row=>(
            <View key={row.key} style={styles.stageRow}>
              <Text style={styles.stageLabel}>{row.label}</Text>
              <View style={styles.stageInputWrap}>
                <TextInput style={styles.stageInput} keyboardType="numeric" value={String(stages[row.key as keyof typeof stages])} onChangeText={v=>updStage(row.key,v)}/>
                <Text style={styles.stageUnit}>ppm</Text>
              </View>
            </View>
          ))}
          <Text style={styles.hint}>CSI thresholds adjust automatically per stage</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SYSTEM</Text>
          <Text style={styles.inputLabel}>Backend URL</Text>
          <TextInput style={styles.urlInput} value={s.backendUrl} onChangeText={v=>upd('backendUrl',v)} autoCapitalize="none"/>
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={save}><Text style={styles.saveBtnText}>Save Settings</Text></TouchableOpacity>
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  header:{backgroundColor:COLORS.green,paddingTop:50,paddingBottom:16,paddingHorizontal:16},
  headerTitle:{color:'#D8EBD0',fontSize:18,fontWeight:'600'},
  section:{backgroundColor:COLORS.card,borderRadius:14,borderWidth:0.5,borderColor:COLORS.border,padding:14,marginBottom:12},
  sectionTitle:{fontSize:11,fontWeight:'600',color:COLORS.green,letterSpacing:0.8,marginBottom:12},
  presets:{flexDirection:'row',gap:8,marginBottom:12,flexWrap:'wrap'},
  preset:{paddingHorizontal:14,paddingVertical:7,borderRadius:99,backgroundColor:COLORS.surface,borderWidth:0.5,borderColor:COLORS.border},
  presetActive:{backgroundColor:COLORS.green},
  presetText:{fontSize:12,color:COLORS.muted,fontWeight:'500'},
  presetTextActive:{color:'#D8EBD0'},
  customRow:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:10},
  customLabel:{fontSize:13,color:COLORS.muted,flex:1},
  customInput:{width:70,backgroundColor:COLORS.surface,borderRadius:8,padding:8,fontSize:14,color:COLORS.text,textAlign:'center',borderWidth:0.5,borderColor:COLORS.border},
  modeBadge:{padding:8,borderRadius:8,marginBottom:8},
  modeText:{fontSize:12,fontWeight:'600',textAlign:'center'},
  hint:{fontSize:10,color:COLORS.muted,marginTop:4,fontStyle:'italic'},
  threshRow:{marginBottom:10},
  threshTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:4},
  threshLabel:{fontSize:13,color:COLORS.text},
  threshInputWrap:{flexDirection:'row',alignItems:'center',gap:4},
  threshInput:{width:60,backgroundColor:COLORS.surface,borderRadius:7,padding:6,fontSize:14,fontWeight:'600',textAlign:'right',borderWidth:0.5,borderColor:COLORS.border},
  threshUnit:{fontSize:11,color:COLORS.muted},
  stageRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:8,borderBottomWidth:0.5,borderBottomColor:COLORS.surface},
  stageLabel:{fontSize:13,color:COLORS.text},
  stageInputWrap:{flexDirection:'row',alignItems:'center',gap:4},
  stageInput:{width:65,backgroundColor:COLORS.surface,borderRadius:7,padding:6,fontSize:13,fontWeight:'600',textAlign:'right',borderWidth:0.5,borderColor:COLORS.border,color:COLORS.text},
  stageUnit:{fontSize:11,color:COLORS.muted},
  inputLabel:{fontSize:12,color:COLORS.muted,marginBottom:6,textTransform:'uppercase',letterSpacing:0.5},
  urlInput:{backgroundColor:COLORS.surface,borderRadius:9,padding:10,fontSize:13,color:COLORS.text,borderWidth:0.5,borderColor:COLORS.border},
  saveBtn:{backgroundColor:COLORS.green,padding:14,borderRadius:12,alignItems:'center',marginTop:4},
  saveBtnText:{color:'#D8EBD0',fontSize:15,fontWeight:'600'},
})
