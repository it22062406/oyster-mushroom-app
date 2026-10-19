import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';

import { MoisturePredictionCard } from '@/components/moisture/PredictionCard';
import { MoistureSensorCard } from '@/components/moisture/SensorCard';
import { MoistureStatusBadge } from '@/components/moisture/StatusBadge';
import { MoistureTSIChart } from '@/components/moisture/TSIChart';
import { MOISTURE_COLORS } from '@/constants/moistureConstants';
import { database, ref, onValue, query, orderByKey, limitToLast } from '@/services/moistureFirebase';
import {
  fetchPrediction,
  formatUnixTimestamp,
  getRecommendation,
  type PredictionResult,
  type SensorReading,
} from '@/services/moisturePredictionApi';

interface LatestData {
  temperature: number;
  humidity: number;
  tsi: number;
  status: string;
  timestamp: number;
}

export function MoistureDashboardScreen() {
  const [latest, setLatest] = useState<LatestData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [availableReadings, setAvailableReadings] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [readingsKey, setReadingsKey] = useState(0);

  const loadPrediction = useCallback(async (readings: SensorReading[]) => {
    setAvailableReadings(readings.length);

    if (readings.length < 4) {
      setPrediction(null);
      setRecommendation(null);
      return;
    }

    setPredictionLoading(true);
    setPredictionError(null);

    try {
      const result = await fetchPrediction(readings);
      setPrediction(result);
      setRecommendation(getRecommendation(result.predictedTsi));
    } catch (err) {
      setPrediction(null);
      setRecommendation(null);
      setPredictionError(err instanceof Error ? err.message : 'Failed to fetch prediction');
    } finally {
      setPredictionLoading(false);
    }
  }, []);

  useEffect(() => {
    const latestRef = ref(database, 'latest');
    const unsubscribeLatest = onValue(latestRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLatest(data);
      }
    });

    const roomRef = query(ref(database, 'room1'), orderByKey(), limitToLast(30));
    const unsubscribeRoom = onValue(roomRef, (snapshot) => {
      const readings: SensorReading[] = [];
      snapshot.forEach((child) => {
        const val = child.val();
        const key = child.key;
        if (!key || val.temperature === undefined || val.humidity === undefined) return;

        readings.push({
          timestamp: formatUnixTimestamp(parseInt(key, 10)),
          temperature_c: Number(val.temperature),
          humidity_percent: Number(val.humidity),
        });
      });

      readings.sort(
        (a, b) =>
          new Date(a.timestamp.replace(' ', 'T')).getTime() -
          new Date(b.timestamp.replace(' ', 'T')).getTime()
      );

      loadPrediction(readings.slice(-4));
    });

    return () => {
      unsubscribeLatest();
      unsubscribeRoom();
    };
  }, [loadPrediction, readingsKey]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setReadingsKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const formatTimestamp = (ts: number): string => {
    const date = new Date(ts * 1000);
    return date.toLocaleString();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={MOISTURE_COLORS.accent} />
      }
    >
      {latest && (
        <Text style={styles.lastUpdated}>Last updated: {formatTimestamp(latest.timestamp)}</Text>
      )}

      <View style={styles.cardsGrid}>
        <MoistureSensorCard
          title="Temperature"
          value={latest ? latest.temperature.toFixed(1) : '--'}
          unit="°C"
          icon="thermometer-outline"
          color="#C47B2B"
        />
        <MoistureSensorCard
          title="Humidity"
          value={latest ? latest.humidity.toString() : '--'}
          unit="%"
          icon="water-outline"
          color="#4A7C59"
        />
        <MoistureSensorCard
          title="TSI Value"
          value={latest ? latest.tsi.toFixed(1) : '--'}
          unit=""
          icon="pulse-outline"
          color="#6B8E6B"
        />
        <MoistureStatusBadge status={latest?.status || '--'} tsi={latest?.tsi || 0} />
      </View>

      <MoisturePredictionCard
        prediction={prediction}
        loading={predictionLoading}
        error={predictionError}
        recommendation={recommendation}
        availableReadings={availableReadings}
      />

      <MoistureTSIChart />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MOISTURE_COLORS.surface,
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  lastUpdated: {
    color: MOISTURE_COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
