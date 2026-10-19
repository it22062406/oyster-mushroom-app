import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';

import { MOISTURE_COLORS } from '@/constants/moistureConstants';
import type { RootStackParamList } from '@/navigation/types';
import type { FarmAlert } from '@/services/alertActions';
import { database, limitToLast, onValue, query, ref } from '@/services/moistureFirebase';

const canUseNotifications = !(
  Constants.appOwnership === 'expo' && Platform.OS === 'android'
);

interface AlertData {
  type: string;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: number;
}

async function registerForNotifications() {
  if (!canUseNotifications) return false;

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Mushroom Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#CD5C5C',
      sound: 'default',
    });
  }

  return true;
}

async function sendLocalNotification(alert: AlertData) {
  if (!canUseNotifications) return;

  const Notifications = await import('expo-notifications');
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${alert.severity === 'critical' ? '🚨 CRITICAL' : '⚠️ WARNING'} Alert`,
      body: alert.message,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
}

export function MoistureAlertBanner() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [visible, setVisible] = useState(false);
  const [alert, setAlert] = useState<FarmAlert | null>(null);
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const lastNotifiedId = useRef<string | null>(null);
  const notificationsReady = useRef(false);

  const showBanner = () => {
    setVisible(true);
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(5000),
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  };

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    registerForNotifications().then((granted) => {
      if (cancelled) return;
      notificationsReady.current = granted;

      unsubscribe = onValue(query(ref(database, 'alerts'), limitToLast(1)), (snapshot) => {
        snapshot.forEach((child) => {
          const id = child.key;
          const nextAlert = child.val() as Omit<FarmAlert, 'id'> | null;
          if (!id || !nextAlert?.message || !nextAlert.severity) return;
          if (lastNotifiedId.current === id) return;

          lastNotifiedId.current = id;
          setAlert({ ...nextAlert, id });
          showBanner();
          if (notificationsReady.current) {
            sendLocalNotification(nextAlert);
          }
        });
      });
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const openDetail = () => {
    if (!alert) return;
    navigation.navigate('AlertDetail', alert);
    dismiss();
  };

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  if (!visible || !alert) return null;

  const isCritical = alert.severity === 'critical';
  const bgColor = isCritical ? MOISTURE_COLORS.critical : MOISTURE_COLORS.warning;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }], backgroundColor: bgColor },
      ]}
    >
      <TouchableOpacity style={styles.content} onPress={openDetail} activeOpacity={0.9}>
        <Ionicons name={isCritical ? 'alert-circle' : 'warning'} size={22} color="#fff" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isCritical ? '🚨 CRITICAL ALERT' : '⚠️ WARNING'}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {alert.message}
          </Text>
        </View>
        <TouchableOpacity onPress={dismiss} hitSlop={8}>
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  message: {
    color: '#fff',
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
});
