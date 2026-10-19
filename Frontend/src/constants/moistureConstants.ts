import { devServerOrigin } from '@/constants/config';

export const MOISTURE_API_BASE_URL = devServerOrigin(3000);

export const MOISTURE_COLORS = {
  primary: '#3D5C3D',
  surface: '#F4F1EC',
  card: '#FFFFFF',
  accent: '#4A7C59',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  warning: '#C47B2B',
  critical: '#9B3B3B',
  excellent: '#4A7C59',
  good: '#6B8E6B',
  border: '#E2DDD7',
};

export const TSI_STATUS_COLORS: Record<string, string> = {
  Excellent: MOISTURE_COLORS.excellent,
  Good: MOISTURE_COLORS.good,
  Warning: MOISTURE_COLORS.warning,
  Critical: MOISTURE_COLORS.critical,
};

export const MOISTURE_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAkSveLCTuQcql5tP_MEKowMGh_X8UhZ6Y',
  authDomain: 'oyster-mushroom-1ec4a.firebaseapp.com',
  databaseURL:
    'https://oyster-mushroom-1ec4a-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'oyster-mushroom-1ec4a',
  storageBucket: 'oyster-mushroom-1ec4a.firebasestorage.app',
  messagingSenderId: '552532606499',
  appId: '1:552532606499:web:8691565bb594684fc37b96',
};

export const MOISTURE_APP_SETTINGS = {
  enableInAppToast: false,
};

export const MOISTURE_TIME_FILTERS = [
  { label: '24h', hours: 24 },
  { label: '7d', hours: 7 * 24 },
  { label: '1m', hours: 30 * 24 },
  { label: '3m', hours: 90 * 24 },
  { label: '6m', hours: 180 * 24 },
  { label: '1y', hours: 365 * 24 },
] as const;
