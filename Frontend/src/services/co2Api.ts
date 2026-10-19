import axios from 'axios'

import { devServerOrigin } from '@/constants/config'

const DEFAULT_URL = devServerOrigin(8000)

interface MemStore {
  backendUrl: string
  sensorInterval: string
  co2Warning: string
  co2Critical: string
  humidityWarning: string
  tempWarning: string
  userName: string
  userEmail: string
  farmName: string
  isLoggedIn: string
  profileImage: string
}

export const memStore: MemStore = {
  backendUrl: DEFAULT_URL,
  sensorInterval: '10',
  co2Warning: '900',
  co2Critical: '1200',
  humidityWarning: '85',
  tempWarning: '28',
  userName: '',
  userEmail: '',
  farmName: 'Oyster Mushroom Farm',
  isLoggedIn: 'false',
  profileImage: '',
}

export const api = {
  getAllRacks: async () => axios.get(`${memStore.backendUrl}/sensor/all-racks`),
  getLatestAll: async () => axios.get(`${memStore.backendUrl}/sensor/latest-all`),
  getAlerts: async () => axios.get(`${memStore.backendUrl}/sensor/alerts`),
  addRack: async (data: any) => axios.post(`${memStore.backendUrl}/racks/add`, data),
  analyzeImage: async (rackId: string, formData: FormData) => axios.post(`${memStore.backendUrl}/image/analyze/${rackId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  saveBaseline: async (rackId: string, formData: FormData) => axios.post(`${memStore.backendUrl}/image/baseline/${rackId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getSensorInterval: async () => parseInt(memStore.sensorInterval),
  setSensorInterval: async (seconds: number) => { memStore.sensorInterval = seconds.toString() },
  getSettings: async () => ({
    backendUrl: memStore.backendUrl,
    sensorInterval: parseInt(memStore.sensorInterval),
    co2Warning: parseInt(memStore.co2Warning),
    co2Critical: parseInt(memStore.co2Critical),
    humidityWarning: parseInt(memStore.humidityWarning),
    tempWarning: parseInt(memStore.tempWarning),
  }),
  saveSettings: async (s: any) => {
    memStore.backendUrl = s.backendUrl
    memStore.sensorInterval = s.sensorInterval.toString()
    memStore.co2Warning = s.co2Warning.toString()
    memStore.co2Critical = s.co2Critical.toString()
    memStore.humidityWarning = s.humidityWarning.toString()
    memStore.tempWarning = s.tempWarning.toString()
  },
  login: async (email: string, password: string) => {
    const res = await axios.post(`${memStore.backendUrl}/auth/login`, { email, password })
    memStore.userName = res.data.name || ''
    memStore.userEmail = res.data.email || ''
    memStore.farmName = res.data.farm_name || 'Oyster Mushroom Farm'
    memStore.isLoggedIn = 'true'
    return res
  },
  register: async (data: any) => {
    const res = await axios.post(`${memStore.backendUrl}/auth/register`, data)
    return res
  },
  resetPassword: async (email: string, newPassword: string) => {
    return axios.post(`${memStore.backendUrl}/auth/reset-password`, { email, new_password: newPassword })
  },
  logout: async () => {
    memStore.userName = ''
    memStore.userEmail = ''
    memStore.isLoggedIn = 'false'
  },
  getUser: () => ({
    name: memStore.userName || 'Farm Administrator',
    email: memStore.userEmail || '',
    farmName: memStore.farmName || 'Oyster Mushroom Farm',
    isLoggedIn: memStore.isLoggedIn === 'true',
  }),
  setProfileImage: async (uri: string) => { memStore.profileImage = uri },
  getProfileImage: async () => memStore.profileImage || '',
  removeRack: async (rackId: string) => {
    return axios.delete(`${memStore.backendUrl}/racks/remove/${rackId}`)
  },
  detectRacks: async () => {
    return axios.get(`${memStore.backendUrl}/racks/list`)
  },
  renameRack: async (rackId: string, displayName: string, location: string) => {
    return axios.put(`${memStore.backendUrl}/racks/rename/${rackId}`, {
      new_rack_id: displayName,
      location: location
    })
  },
}
