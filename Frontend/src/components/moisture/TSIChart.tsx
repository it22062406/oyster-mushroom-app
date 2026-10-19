import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { MOISTURE_COLORS, MOISTURE_TIME_FILTERS } from '@/constants/moistureConstants';
import { database, ref, onValue, query, orderByKey, startAt } from '@/services/moistureFirebase';

const screenWidth = Dimensions.get('window').width - 32;

interface ChartDataPoint {
  timestamp: number;
  tsi: number;
}

export function MoistureTSIChart() {
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const filter = MOISTURE_TIME_FILTERS[selectedFilter];
    const startTimestamp = Math.floor((Date.now() - filter.hours * 3600 * 1000) / 1000);

    const roomRef = query(
      ref(database, 'room1'),
      orderByKey(),
      startAt(startTimestamp.toString())
    );

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data: ChartDataPoint[] = [];
      snapshot.forEach((child) => {
        const val = child.val();
        if (val.tsi !== undefined) {
          data.push({
            timestamp: parseInt(child.key!, 10),
            tsi: val.tsi,
          });
        }
      });
      setChartData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedFilter]);

  const getLabels = (): string[] => {
    if (chartData.length === 0) return [];
    const maxLabels = 5;
    const step = Math.max(1, Math.floor(chartData.length / maxLabels));
    return chartData
      .filter((_, i) => i % step === 0)
      .map((point) => {
        const date = new Date(point.timestamp * 1000);
        const filter = MOISTURE_TIME_FILTERS[selectedFilter];
        if (filter.hours <= 24) {
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
  };

  const getDataPoints = (): number[] => {
    if (chartData.length === 0) return [0];
    const maxPoints = 30;
    if (chartData.length <= maxPoints) return chartData.map((d) => d.tsi);
    const step = Math.floor(chartData.length / maxPoints);
    return chartData.filter((_, i) => i % step === 0).map((d) => d.tsi);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TSI Over Time</Text>

      <View style={styles.filterRow}>
        {MOISTURE_TIME_FILTERS.map((filter, index) => (
          <TouchableOpacity
            key={filter.label}
            style={[styles.filterButton, selectedFilter === index && styles.filterButtonActive]}
            onPress={() => setSelectedFilter(index)}
          >
            <Text
              style={[styles.filterText, selectedFilter === index && styles.filterTextActive]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={MOISTURE_COLORS.accent} size="small" />
        </View>
      ) : chartData.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.noDataText}>No data available for this period</Text>
        </View>
      ) : (
        <LineChart
          data={{
            labels: getLabels(),
            datasets: [{ data: getDataPoints() }],
          }}
          width={screenWidth}
          height={200}
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: MOISTURE_COLORS.card,
            backgroundGradientFrom: MOISTURE_COLORS.card,
            backgroundGradientTo: MOISTURE_COLORS.surface,
            color: (opacity = 1) => `rgba(74, 124, 89, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: { borderRadius: 12 },
            propsForDots: {
              r: '3',
              strokeWidth: '1',
              stroke: MOISTURE_COLORS.primary,
            },
          }}
          bezier
          style={styles.chart}
        />
      )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    color: MOISTURE_COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 6,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: MOISTURE_COLORS.surface,
    borderWidth: 1,
    borderColor: MOISTURE_COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: MOISTURE_COLORS.primary,
    borderColor: MOISTURE_COLORS.primary,
  },
  filterText: {
    color: MOISTURE_COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  chart: {
    borderRadius: 12,
    marginLeft: -16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: MOISTURE_COLORS.textSecondary,
    fontSize: 14,
  },
});
