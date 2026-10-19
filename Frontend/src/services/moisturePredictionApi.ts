import { MOISTURE_API_BASE_URL } from '@/constants/moistureConstants';

export interface SensorReading {
  timestamp: string;
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

export function formatUnixTimestamp(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function getRecommendation(predictedTsi: number): string {
  if (predictedTsi <= 25) {
    return 'Conditions look excellent. Maintain current temperature and humidity levels.';
  }
  if (predictedTsi <= 50) {
    return 'Conditions are good. Monitor humidity and temperature for stable growth.';
  }
  if (predictedTsi <= 70) {
    return 'TSI trending toward warning. Consider adjusting ventilation or humidity.';
  }
  return 'Critical TSI predicted. Take immediate action to stabilize growing conditions.';
}

export async function fetchPrediction(readings: SensorReading[]): Promise<PredictionResult> {
  let response: Response;

  try {
    response = await fetch(`${MOISTURE_API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readings }),
    });
  } catch {
    throw new Error(
      'Cannot reach the prediction API on port 3000. Start it with: cd Backend/moisture && npm run dev:api'
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Prediction failed (${response.status})`);
  }

  return data;
}
