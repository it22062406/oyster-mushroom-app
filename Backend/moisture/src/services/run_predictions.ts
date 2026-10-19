// ============================================================
// EDIT THIS SECTION ONLY — your last 4 sensor readings, in
// chronological order (oldest first, newest/current reading last).
// You need 4 because the model uses the 3 previous readings as
// context (lag features) to predict the current one.
// ============================================================
const readings = [
  { timestamp: '2026-05-15 00:40:00', temperature_c: 24.9, humidity_percent: 93.8 },
  { timestamp: '2026-05-15 00:50:00', temperature_c: 24.7, humidity_percent: 95.1 },
  { timestamp: '2026-05-15 01:00:00', temperature_c: 24.8, humidity_percent: 95.1 },
  { timestamp: '2026-05-15 01:10:00', temperature_c: 25.0, humidity_percent: 94.0 }, // <-- prediction is made for this one
];
// ============================================================

import { predictNextTSI } from './predictionService';

const result = predictNextTSI(readings);

console.log(
  `Reading at ${result.timestamp}: ${result.temperature_c}°C, ${result.humidity_percent}% RH`
);
console.log('Predicted TSI:', result.predictedTsi.toFixed(2));
