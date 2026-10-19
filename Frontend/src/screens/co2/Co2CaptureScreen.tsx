import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'

import { COLORS } from '@/constants/co2Colors'
import { api } from '@/services/co2Api'

export function Co2CaptureScreen() {
  const [racks, setRacks] = useState<any[]>([])
  const [selectedRack, setSelectedRack] = useState('')
  const [image, setImage] = useState<string|null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  useEffect(() => { api.getAllRacks().then(r=>{const d=r.data||[];setRacks(d);if(d.length>0)setSelectedRack(d[0].rack_id)}).catch(()=>{}) },[])
  const pickImage = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync()
    if(!p.granted){Alert.alert('Permission needed','Camera access required');return}
    const r = await ImagePicker.launchCameraAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,quality:0.8})
    if(!r.canceled){setImage(r.assets[0]!.uri);setResult(null)}
  }
  const pickGallery = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,quality:0.8})
    if(!r.canceled){setImage(r.assets[0]!.uri);setResult(null)}
  }
  const analyze = async () => {
    if(!image||!selectedRack)return
    setAnalyzing(true)
    try {
      const fd = new FormData()
      fd.append('file',{uri:image,name:'image.jpg',type:'image/jpeg'} as any)
      const res = await api.analyzeImage(selectedRack,fd)
      setResult(res.data)
    } catch(e){Alert.alert('Error','Analysis failed')} finally{setAnalyzing(false)}
  }
  const saveBaseline = async () => {
    if(!image||!selectedRack)return
    try {
      const fd = new FormData()
      fd.append('file',{uri:image,name:'baseline.jpg',type:'image/jpeg'} as any)
      await api.saveBaseline(selectedRack,fd)
      Alert.alert('✅ Saved',`Baseline saved for ${selectedRack}`)
    } catch(e){Alert.alert('Error','Could not save baseline')}
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Image Validation</Text></View>
      <ScrollView contentContainerStyle={{padding:14}}>
        <Text style={styles.sectionLabel}>SELECT RACK</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:14}}>
          {racks.map((r,i)=>(
            <TouchableOpacity key={i} style={[styles.rackPill,selectedRack===r.rack_id&&styles.rackPillActive]} onPress={()=>setSelectedRack(r.rack_id)}>
              <Text style={[styles.rackPillText,selectedRack===r.rack_id&&styles.rackPillTextActive]}>{r.rack_id?.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.cameraCard}>
          <View style={styles.cameraIconWrap}><Ionicons name="camera" size={32} color={COLORS.green}/></View>
          <Text style={styles.cameraTitle}>Capture mushroom image</Text>
          <Text style={styles.cameraSub}>Photo for CO₂ stress visual validation</Text>
          {image&&<Image source={{uri:image}} style={styles.preview}/>}
          <TouchableOpacity style={styles.primaryBtn} onPress={pickImage}><Ionicons name="camera" size={18} color="#D8EBD0"/><Text style={styles.primaryBtnText}>Take Photo</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={pickGallery}><Ionicons name="images" size={18} color={COLORS.green}/><Text style={styles.secondaryBtnText}>Choose from Gallery</Text></TouchableOpacity>
        </View>
        {image&&<TouchableOpacity style={styles.baselineBtn} onPress={saveBaseline}><Ionicons name="save" size={18} color={COLORS.green}/><Text style={styles.baselineBtnText}>Save as Baseline</Text></TouchableOpacity>}
        {image&&<TouchableOpacity style={[styles.primaryBtn,{opacity:analyzing?0.7:1}]} onPress={analyze} disabled={analyzing}>
          {analyzing?<ActivityIndicator size="small" color="#D8EBD0"/>:<Ionicons name="analytics" size={18} color="#D8EBD0"/>}
          <Text style={styles.primaryBtnText}>{analyzing?'Analyzing...':'Analyze for Stress'}</Text>
        </TouchableOpacity>}
        {result&&<View style={styles.resultCard}>
          <Text style={styles.resultTitle}>📊 Analysis Result</Text>
          {[
            {key:'Stress Level',val:result.stress,color:result.stress?.includes('High')?COLORS.high:COLORS.normal},
            {key:'Confidence',val:result.confidence?`${(result.confidence*100).toFixed(1)}%`:'—'},
            {key:'Symptom',val:result.symptom||'—'},
            {key:'Cap Change',val:result.growth_rate!=null?`${result.growth_rate}%`:'—',color:result.growth_rate<0?COLORS.high:COLORS.normal},
            {key:'ML Result',val:result.ml_result||'—',color:result.ml_result==='Stressed'?COLORS.high:COLORS.normal},
            {key:'Recon Error',val:result.reconstruction_error!=null?result.reconstruction_error.toFixed(5):'—'},
          ].map((row,i)=>(
            <View key={i} style={styles.resultRow}>
              <Text style={styles.resultKey}>{row.key}</Text>
              <Text style={[styles.resultVal,row.color?{color:row.color}:{}]}>{row.val}</Text>
            </View>
          ))}
        </View>}
        <View style={{height:20}}/>
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  header:{backgroundColor:COLORS.green,paddingTop:50,paddingBottom:16,paddingHorizontal:16},
  headerTitle:{color:'#D8EBD0',fontSize:18,fontWeight:'600'},
  sectionLabel:{fontSize:10,color:COLORS.muted,letterSpacing:1.2,textTransform:'uppercase',marginBottom:8},
  rackPill:{paddingHorizontal:14,paddingVertical:7,borderRadius:99,backgroundColor:COLORS.card,borderWidth:0.5,borderColor:COLORS.border,marginRight:8},
  rackPillActive:{backgroundColor:COLORS.green},
  rackPillText:{fontSize:12,color:COLORS.muted,fontWeight:'500'},
  rackPillTextActive:{color:'#D8EBD0'},
  cameraCard:{backgroundColor:COLORS.card,borderRadius:14,borderWidth:0.5,borderColor:COLORS.border,padding:16,alignItems:'center',marginBottom:10},
  cameraIconWrap:{width:64,height:64,borderRadius:32,backgroundColor:COLORS.normalBg,alignItems:'center',justifyContent:'center',marginBottom:10},
  cameraTitle:{fontSize:15,fontWeight:'600',color:COLORS.text,marginBottom:4},
  cameraSub:{fontSize:12,color:COLORS.muted,marginBottom:14,textAlign:'center'},
  preview:{width:'100%',height:180,borderRadius:10,marginBottom:12},
  primaryBtn:{width:'100%',padding:13,borderRadius:11,backgroundColor:COLORS.green,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,marginBottom:8},
  primaryBtnText:{color:'#D8EBD0',fontSize:14,fontWeight:'600'},
  secondaryBtn:{width:'100%',padding:11,borderRadius:11,backgroundColor:COLORS.surface,borderWidth:0.5,borderColor:COLORS.border,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},
  secondaryBtnText:{color:COLORS.green,fontSize:13,fontWeight:'500'},
  baselineBtn:{width:'100%',padding:11,borderRadius:11,backgroundColor:COLORS.normalBg,borderWidth:0.5,borderColor:COLORS.normal,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10},
  baselineBtnText:{color:COLORS.green,fontSize:13,fontWeight:'500'},
  resultCard:{backgroundColor:COLORS.card,borderRadius:12,borderWidth:0.5,borderColor:COLORS.border,padding:14,marginTop:10},
  resultTitle:{fontSize:14,fontWeight:'600',color:COLORS.text,marginBottom:10},
  resultRow:{flexDirection:'row',justifyContent:'space-between',paddingVertical:7,borderBottomWidth:0.5,borderBottomColor:COLORS.surface},
  resultKey:{fontSize:12,color:COLORS.muted},
  resultVal:{fontSize:12,fontWeight:'600',color:COLORS.text},
})
