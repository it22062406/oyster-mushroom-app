import { db } from './firebase';
import {
  ALERT_TEMP_HIGH,
  ALERT_TEMP_LOW,
  ALERT_HUMIDITY_LOW,
  ALERT_HUMIDITY_HIGH,
  TSI_WARNING_THRESHOLD,
  TSI_CRITICAL_THRESHOLD,
  ALERT_COOLDOWN_MS,
} from '../config/thresholds';

type AlertType = 'temperature' | 'humidity' | 'tsi';
type AlertSeverity = 'warning' | 'critical';

interface Alert {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
}

const lastAlertTimestamps: Record<string, number> = {};

function canSendAlert(alertKey: string): boolean {
  const lastSent = lastAlertTimestamps[alertKey] || 0;
  return Date.now() - lastSent >= ALERT_COOLDOWN_MS;
}

function recordAlert(alertKey: string): void {
  lastAlertTimestamps[alertKey] = Date.now();
}

async function pushAlert(alert: Alert): Promise<void> {
  const alertKey = `${alert.type}_${alert.severity}`;

  if (!canSendAlert(alertKey)) {
    return;
  }

  await db.ref('alerts').push(alert);
  recordAlert(alertKey);
  console.log(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`);
}

export async function checkAndSendAlerts(
  temperature: number,
  humidity: number,
  tsi: number,
  timestamp: number,
): Promise<void> {
  if (temperature > ALERT_TEMP_HIGH) {
    await pushAlert({
      type: 'temperature',
      severity: 'critical',
      message: `Temperature critically high: ${temperature}°C (threshold: ${ALERT_TEMP_HIGH}°C)`,
      value: temperature,
      threshold: ALERT_TEMP_HIGH,
      timestamp,
    });
  } else if (temperature < ALERT_TEMP_LOW) {
    await pushAlert({
      type: 'temperature',
      severity: 'critical',
      message: `Temperature critically low: ${temperature}°C (threshold: ${ALERT_TEMP_LOW}°C)`,
      value: temperature,
      threshold: ALERT_TEMP_LOW,
      timestamp,
    });
  }

  if (humidity < ALERT_HUMIDITY_LOW) {
    await pushAlert({
      type: 'humidity',
      severity: 'critical',
      message: `Humidity critically low: ${humidity}% (threshold: ${ALERT_HUMIDITY_LOW}%)`,
      value: humidity,
      threshold: ALERT_HUMIDITY_LOW,
      timestamp,
    });
  } else if (humidity > ALERT_HUMIDITY_HIGH) {
    await pushAlert({
      type: 'humidity',
      severity: 'warning',
      message: `Humidity too high: ${humidity}% (threshold: ${ALERT_HUMIDITY_HIGH}%)`,
      value: humidity,
      threshold: ALERT_HUMIDITY_HIGH,
      timestamp,
    });
  }

  if (tsi > TSI_CRITICAL_THRESHOLD) {
    await pushAlert({
      type: 'tsi',
      severity: 'critical',
      message: `TSI critical: ${tsi} (threshold: ${TSI_CRITICAL_THRESHOLD})`,
      value: tsi,
      threshold: TSI_CRITICAL_THRESHOLD,
      timestamp,
    });
  } else if (tsi > TSI_WARNING_THRESHOLD) {
    await pushAlert({
      type: 'tsi',
      severity: 'warning',
      message: `TSI warning: ${tsi} (threshold: ${TSI_WARNING_THRESHOLD})`,
      value: tsi,
      threshold: TSI_WARNING_THRESHOLD,
      timestamp,
    });
  }
}
