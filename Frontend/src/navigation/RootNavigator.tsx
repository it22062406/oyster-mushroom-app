import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { CameraScreen } from '@/screens/CameraScreen';
import { AddDeviceModal } from '@/screens/co2/AddDeviceModal';
import { LoginScreen } from '@/screens/co2/LoginScreen';
import { NotificationsModal } from '@/screens/co2/NotificationsModal';
import { ProfileModal } from '@/screens/co2/ProfileModal';
import { RackDetailScreen } from '@/screens/co2/RackDetailScreen';
import { RegisterScreen } from '@/screens/co2/RegisterScreen';
import { ResetPasswordScreen } from '@/screens/co2/ResetPasswordScreen';
import { DetailScreen } from '@/screens/DetailScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { AlertDetailScreen } from '@/screens/moisture/AlertDetailScreen';
import { WebViewScreen } from '@/screens/WebViewScreen';

import { BottomTabs } from './BottomTabs';
import { Co2Tabs } from './Co2Tabs';
import { MoistureTabs } from './MoistureTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="DiseaseDetection"
        component={BottomTabs}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="WebView"
        component={WebViewScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Co2Monitoring"
        component={Co2Tabs}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MoistureMonitoring"
        component={MoistureTabs}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="RackDetail"
        component={RackDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen name="AddDevice" component={AddDeviceModal} options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsModal}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Profile" component={ProfileModal} options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="AlertDetail"
        component={AlertDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
