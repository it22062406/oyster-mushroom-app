/** MoistureTabs — Dashboard / Alerts for Moisture Stress Monitoring (Component 4). */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { MOISTURE_COLORS } from '@/constants/moistureConstants';
import type { RootStackParamList } from '@/navigation/types';
import { MoistureAlertsScreen } from '@/screens/moisture/MoistureAlertsScreen';
import { MoistureDashboardScreen } from '@/screens/moisture/MoistureDashboardScreen';

import type { MoistureTabParamList } from './types';

const Tab = createBottomTabNavigator<MoistureTabParamList>();

type Nav = NativeStackNavigationProp<RootStackParamList>;

function MoistureHeader() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={22} color={MOISTURE_COLORS.text} />
      </TouchableOpacity>
    </View>
  );
}

export function MoistureTabs() {
  return (
    <View style={styles.container}>
      <MoistureHeader />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: MOISTURE_COLORS.card,
            borderTopColor: MOISTURE_COLORS.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 65,
          },
          tabBarActiveTintColor: MOISTURE_COLORS.primary,
          tabBarInactiveTintColor: MOISTURE_COLORS.textSecondary,
        }}
      >
        <Tab.Screen
          name="MoistureDashboard"
          component={MoistureDashboardScreen}
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="speedometer-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="MoistureAlerts"
          component={MoistureAlertsScreen}
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="notifications-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MOISTURE_COLORS.surface,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MOISTURE_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MOISTURE_COLORS.border,
  },
});
