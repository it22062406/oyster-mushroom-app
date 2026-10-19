/** Navigation param lists. */
import type { NavigatorScreenParams } from '@react-navigation/native';

import type { FarmAlert } from '@/services/alertActions';

export type TabParamList = {
  Capture: undefined;
  Tracking: undefined;
  History: undefined;
};

export type Co2TabParamList = {
  Co2Home: undefined;
  Racks: undefined;
  Co2Capture: undefined;
  Co2Settings: undefined;
};

export type MoistureTabParamList = {
  MoistureDashboard: undefined;
  MoistureAlerts: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
  Home: undefined;
  DiseaseDetection: NavigatorScreenParams<TabParamList>;
  Camera: undefined;
  Detail: { id: number };
  WebView: { url: string; title: string };
  Co2Monitoring: NavigatorScreenParams<Co2TabParamList>;
  MoistureMonitoring: NavigatorScreenParams<MoistureTabParamList>;
  RackDetail: { id: string };
  AddDevice: undefined;
  Notifications: undefined;
  Profile: undefined;
  AlertDetail: FarmAlert;
};
