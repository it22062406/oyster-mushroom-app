export const OPTIMAL_TEMP_MIN = 20;
export const OPTIMAL_TEMP_MAX = 28;

export const OPTIMAL_HUMIDITY_MIN = 80;
export const OPTIMAL_HUMIDITY_MAX = 95;

export const ALERT_TEMP_HIGH = 32;
export const ALERT_TEMP_LOW = 18;
export const ALERT_HUMIDITY_LOW = 65;
export const ALERT_HUMIDITY_HIGH = 98;

export const TSI_WARNING_THRESHOLD = 50;
export const TSI_CRITICAL_THRESHOLD = 70;

export const ALERT_COOLDOWN_MS = 0.1 * 60 * 1000; // 15 minutes

export const TSI_STATUS = {
  EXCELLENT: { min: 0, max: 25, label: "Excellent" },
  GOOD: { min: 26, max: 50, label: "Good" },
  WARNING: { min: 51, max: 70, label: "Warning" },
  CRITICAL: { min: 71, max: 100, label: "Critical" },
} as const;

export function getStatusFromTSI(tsi: number): string {
  if (tsi <= TSI_STATUS.EXCELLENT.max) return TSI_STATUS.EXCELLENT.label;
  if (tsi <= TSI_STATUS.GOOD.max) return TSI_STATUS.GOOD.label;
  if (tsi <= TSI_STATUS.WARNING.max) return TSI_STATUS.WARNING.label;
  return TSI_STATUS.CRITICAL.label;
}
