/** Co2Tabs — Home / Racks / Capture / Settings for CO₂ Stress Monitoring. */
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { COLORS } from '@/constants/co2Colors';
import { Co2CaptureScreen } from '@/screens/co2/Co2CaptureScreen';
import { Co2HomeScreen } from '@/screens/co2/Co2HomeScreen';
import { Co2SettingsScreen } from '@/screens/co2/Co2SettingsScreen';
import { RacksScreen } from '@/screens/co2/RacksScreen';

import type { Co2TabParamList } from './types';

const Tab = createBottomTabNavigator<Co2TabParamList>();

const ICONS: Record<
  keyof Co2TabParamList,
  { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }
> = {
  Co2Home: { active: 'home', inactive: 'home-outline' },
  Racks: { active: 'layers', inactive: 'layers-outline' },
  Co2Capture: { active: 'camera', inactive: 'camera-outline' },
  Co2Settings: { active: 'settings', inactive: 'settings-outline' },
};

const LABELS: Record<keyof Co2TabParamList, string> = {
  Co2Home: 'Home',
  Racks: 'Racks',
  Co2Capture: 'Capture',
  Co2Settings: 'Settings',
};

export function Co2Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        title: LABELS[route.name as keyof Co2TabParamList],
        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
        },
        tabBarLabelStyle: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3 },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons
            name={
              focused
                ? ICONS[route.name as keyof Co2TabParamList].active
                : ICONS[route.name as keyof Co2TabParamList].inactive
            }
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Co2Home" component={Co2HomeScreen} />
      <Tab.Screen name="Racks" component={RacksScreen} />
      <Tab.Screen name="Co2Capture" component={Co2CaptureScreen} />
      <Tab.Screen name="Co2Settings" component={Co2SettingsScreen} />
    </Tab.Navigator>
  );
}
