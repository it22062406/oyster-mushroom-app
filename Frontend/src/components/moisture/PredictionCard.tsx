import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

import { MOISTURE_COLORS } from '@/constants/moistureConstants';
import type { PredictionResult } from '@/services/moisturePredictionApi';

interface PredictionCardProps {
  prediction: PredictionResult | null;
  loading: boolean;
  error: string | null;
  recommendation: string | null;
  availableReadings?: number;
}

export function MoisturePredictionCard({
  prediction,
  loading,
  error,
  recommendation,
  availableReadings = 0,
}: PredictionCardProps) {
  const hasData = prediction !== null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bulb-outline" size={20} color={MOISTURE_COLORS.accent} />
        <Text style={styles.title}>AI Predictions</Text>
        {loading && <ActivityIndicator size="small" color={MOISTURE_COLORS.accent} />}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hasData ? (
        <>
          <View style={styles.predictionsRow}>
            <PredictionItem label="Temp" value={`${prediction!.temperature_c}°C`} />
            <PredictionItem label="Humidity" value={`${prediction!.humidity_percent}%`} />
            <PredictionItem label="Current TSI" value={`${prediction!.currentTsi}`} />
            <PredictionItem label="Predicted TSI" value={`${prediction!.predictedTsi}`} highlight />
          </View>
          {recommendation && (
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          )}
        </>
      ) : loading ? (
        <View style={styles.placeholderContent}>
          <Text style={styles.placeholderText}>Fetching predictions from AI model...</Text>
        </View>
      ) : (
        <View style={styles.placeholderContent}>
          <Text style={styles.placeholderText}>
            {availableReadings > 0
              ? `Need 4 recent sensor readings for AI predictions (${availableReadings}/4 available).`
              : 'Waiting for sensor readings from Firebase.'}
          </Text>
          <View style={styles.placeholderRow}>
            <PlaceholderItem label="Current TSI" />
            <PlaceholderItem label="Predicted TSI" />
          </View>
        </View>
      )}
    </View>
  );
}

function PredictionItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.predictionItem}>
      <Text style={styles.predictionLabel}>{label}</Text>
      <Text style={[styles.predictionValue, highlight && styles.predictionValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

function PlaceholderItem({ label }: { label: string }) {
  return (
    <View style={styles.predictionItem}>
      <Text style={styles.predictionLabel}>{label}</Text>
      <Text style={styles.placeholderValue}>--</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: MOISTURE_COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: MOISTURE_COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    color: MOISTURE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  errorText: {
    color: MOISTURE_COLORS.critical,
    fontSize: 13,
    lineHeight: 18,
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderText: {
    color: MOISTURE_COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  placeholderRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  predictionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  predictionItem: {
    alignItems: 'center',
    minWidth: '40%',
  },
  predictionLabel: {
    color: MOISTURE_COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 4,
  },
  predictionValue: {
    color: MOISTURE_COLORS.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  predictionValueHighlight: {
    color: MOISTURE_COLORS.primary,
  },
  placeholderValue: {
    color: MOISTURE_COLORS.textSecondary,
    fontSize: 18,
    fontWeight: '700',
  },
  recommendationBox: {
    backgroundColor: MOISTURE_COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  recommendationText: {
    color: MOISTURE_COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },
});
