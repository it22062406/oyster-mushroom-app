export const COLORS = {
  bg: '#F0EBE0', surface: '#F8F4EE', card: '#FFFFFF',
  border: '#DDD5C8', green: '#2D5A27', greenMid: '#3A7034',
  greenAccent: '#4A8B3E', text: '#1E2B1A', muted: '#7A7060',
  normal: '#2D6B2D', medium: '#8B6A00', high: '#8B3A00', critical: '#8B1A1A',
  normalBg: '#EAF3E0', mediumBg: '#FDF4DC', highBg: '#FDF0E8', criticalBg: '#FDECEC',
  white: '#FFFFFF', blue: '#1A5F8A', teal: '#0F6E56',
}
export const getStressColor = (csi: number) => { if (csi <= 0.30) return COLORS.normal; if (csi <= 0.60) return COLORS.medium; if (csi <= 0.85) return COLORS.high; return COLORS.critical }
export const getStressBg = (csi: number) => { if (csi <= 0.30) return COLORS.normalBg; if (csi <= 0.60) return COLORS.mediumBg; if (csi <= 0.85) return COLORS.highBg; return COLORS.criticalBg }
export const getStressLabel = (csi: number) => { if (csi <= 0.30) return 'Normal'; if (csi <= 0.60) return 'Medium Stress'; if (csi <= 0.85) return 'High Stress'; return 'Critical' }
export const getStressAction = (csi: number) => { if (csi <= 0.30) return '✅ Continue monitoring'; if (csi <= 0.60) return '⚠️ Increase observation'; if (csi <= 0.85) return '🚨 Activate exhaust fan'; return '🔴 Emergency ventilation' }
