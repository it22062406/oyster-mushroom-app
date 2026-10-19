import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { AppText, BotanicalAccent, Card, QuickAccessTile, Screen } from '@/components';
import type { RootStackParamList } from '@/navigation/types';
import { api } from '@/services/co2Api';
import { useAppTheme } from '@/theme/ThemeProvider';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const FARM = { temperature: '24.6 °C', humidity: '78 %' };

const GROWTH_STAGE_URL = 'https://shroomboard.private-staging.vip';

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { colors, spacing, radius } = useAppTheme();
  const [snack, setSnack] = useState<string | null>(null);

  const logout = () => {
    Alert.alert('Log out', 'Leave this account and return to the sign-in screen?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await api.logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing['4xl'], gap: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ flex: 1 }}>
              <AppText variant="hero">Hello, Farmer!</AppText>
              <AppText variant="body" color="textMuted" style={{ marginTop: 2 }}>
                Here&apos;s your farm overview
              </AppText>
            </View>
            <MaterialCommunityIcons
              name="mushroom"
              size={56}
              color={colors.primarySoft}
              style={{ opacity: 0.85 }}
            />
          </View>
          <Pressable
            onPress={logout}
            style={{
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: spacing.md,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.blackMold} />
            <AppText variant="label" style={{ color: colors.blackMold }}>
              Log out
            </AppText>
          </Pressable>
        </View>

        {/* Environment stats */}
        <Card padded>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Stat icon="thermometer" value={FARM.temperature} label="Temperature" />
            <View style={{ width: 1, height: 44, backgroundColor: colors.border }} />
            <Stat icon="water-outline" value={FARM.humidity} label="Humidity" />
          </View>
        </Card>

        {/* Quick access */}
        <View style={{ gap: spacing.md }}>
          <AppText variant="h2">Quick Access</AppText>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              rowGap: spacing.md,
            }}
          >
            <QuickAccessTile
              icon="shield-check-outline"
              label="Disease Detection"
              onPress={() =>
                navigation.navigate('DiseaseDetection', { screen: 'Capture' })
              }
            />
            <QuickAccessTile
              icon="mushroom-outline"
              label="Growth Stage Detection"
              onPress={() => {
                if (Platform.OS === 'web') {
                  Linking.openURL(GROWTH_STAGE_URL);
                } else {
                  navigation.navigate('WebView', {
                    url: GROWTH_STAGE_URL,
                    title: 'Growth Stage Detection',
                  });
                }
              }}
            />
            <QuickAccessTile
              icon="water-outline"
              label="Moisture Stress Monitoring"
              onPress={() =>
                navigation.navigate('MoistureMonitoring', { screen: 'MoistureDashboard' })
              }
            />
            <QuickAccessTile
              icon="molecule-co2"
              label="CO₂ Stress Monitoring"
              onPress={() => navigation.navigate('Co2Monitoring', { screen: 'Co2Home' })}
            />
          </View>
        </View>
      </ScrollView>

      <BotanicalAccent
        size={160}
        color={colors.primarySoft}
        opacity={0.08}
        style={{ position: 'absolute', left: -30, bottom: -20 }}
      />

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={2600}>
        {snack ?? ''}
      </Snackbar>
    </Screen>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string;
  label: string;
}) {
  const { colors, spacing } = useAppTheme();
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.sm,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 15,
          backgroundColor: colors.healthySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View>
        <AppText variant="h2">{value}</AppText>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
      </View>
    </View>
  );
}
