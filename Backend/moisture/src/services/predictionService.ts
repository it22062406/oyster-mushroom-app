import { calculateTSI } from './tsiCalculator';
// tsi_models.ts is auto-generated (see @ts-nocheck at its top) and exports
// via `module.exports`, so it's picked up here through esModuleInterop.
const { predictTSI } = require('../model/tsi_models');

export interface SensorReading {
  timestamp: string; // 'YYYY-MM-DD HH:mm:ss'
  temperature_c: number;
  humidity_percent: number;
}

export interface PredictionResult {
  timestamp: string;
  temperature_c: number;
  humidity_percent: number;
  currentTsi: number;
  predictedTsi: number;
}

function isValidReading(r: unknown): r is SensorReading {
  return (
    typeof r === 'object' &&
    r !== null &&
    typeof (r as SensorReading).timestamp === 'string' &&
    Number.isFinite((r as SensorReading).temperature_c) &&
    Number.isFinite((r as SensorReading).humidity_percent)
  );
}

/**
 * Predicts the TSI for the most recent reading using the trained gradient-boosted
 * model. Needs that reading plus its 3 immediately preceding ones (oldest first),
 * since the model uses lag features from the last 3 readings as context.
 */
export function predictNextTSI(readings: unknown): PredictionResult {
  if (!Array.isArray(readings) || readings.length < 4) {
    throw new Error('At least 4 readings are required (3 history + 1 current), oldest first.');
  }

  if (!readings.every(isValidReading)) {
    throw new Error(
      'Each reading needs a string "timestamp" and numeric "temperature_c"/"humidity_percent".'
    );
  }

  const enriched = readings.map((r) => ({
    ...r,
    tsi: calculateTSI(r.temperature_c, r.humidity_percent),
  }));

  const current = enriched[enriched.length - 1];
  const history = enriched.slice(0, -1).slice(-3); // last 3 readings before current

  const ts = new Date(current.timestamp.replace(' ', 'T'));
  if (Number.isNaN(ts.getTime())) {
    throw new Error(`Invalid timestamp: "${current.timestamp}"`);
  }
  const fracHour = ts.getHours() + ts.getMinutes() / 60;

  const features: Record<string, number> = {
    temperature_c: current.temperature_c,
    humidity_percent: current.humidity_percent,
    hour_sin: Math.sin((2 * Math.PI * fracHour) / 24),
    hour_cos: Math.cos((2 * Math.PI * fracHour) / 24),
  };

  // lag1 = most recent of the 3 history readings, lag3 = oldest
  for (let lag = 1; lag <= 3; lag++) {
    const h = history[history.length - lag];
    features[`temp_lag${lag}`] = h.temperature_c;
    features[`rh_lag${lag}`] = h.humidity_percent;
    features[`tsi_lag${lag}`] = h.tsi;
  }

  return {
    timestamp: current.timestamp,
    temperature_c: current.temperature_c,
    humidity_percent: current.humidity_percent,
    currentTsi: current.tsi,
    predictedTsi: Math.round(predictTSI(features) * 10) / 10,
  };
}
