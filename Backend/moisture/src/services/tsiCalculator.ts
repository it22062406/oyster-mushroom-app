import { OPTIMAL_TEMP_MIN, OPTIMAL_TEMP_MAX } from '../config/thresholds';

/**
 * Calculates Saturation Vapor Pressure using the Tetens formula.
 * @param temperature - Temperature in Celsius
 * @returns SVP in kPa
 */
function calculateSVP(temperature: number): number {
  return 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3));
}

/**
 * Calculates Vapor Pressure Deficit.
 * @param temperature - Temperature in Celsius
 * @param humidity - Relative humidity in %
 * @returns VPD in kPa
 */
function calculateVPD(temperature: number, humidity: number): number {
  const svp = calculateSVP(temperature);
  const avp = svp * (humidity / 100);
  return svp - avp;
}

/**
 * Calculates VPD score (0-100) normalized against extreme stress threshold of 1.5 kPa.
 */
function calculateVPDScore(vpd: number): number {
  return Math.min(100, (vpd / 1.5) * 100);
}

/**
 * Calculates temperature score (0-100).
 * 0 within optimal range (20-28C), increases by 10 points per degree outside.
 */
function calculateTempScore(temperature: number): number {
  if (temperature >= OPTIMAL_TEMP_MIN && temperature <= OPTIMAL_TEMP_MAX) {
    return 0;
  }

  const deviation = temperature < OPTIMAL_TEMP_MIN
    ? OPTIMAL_TEMP_MIN - temperature
    : temperature - OPTIMAL_TEMP_MAX;

  return Math.min(100, deviation * 10);
}

/**
 * Calculates the Transpiration Stress Index (TSI) for oyster mushroom cultivation.
 * TSI ranges from 0 (no stress, perfect conditions) to 100 (extreme stress).
 *
 * Formula: TSI = (0.7 * VPD_score) + (0.3 * Temp_score)
 *
 * @param temperature - Temperature in Celsius
 * @param humidity - Relative humidity in %
 * @returns TSI value (0-100), rounded to 1 decimal place
 */
export function calculateTSI(temperature: number, humidity: number): number {
  const vpd = calculateVPD(temperature, humidity);
  const vpdScore = calculateVPDScore(vpd);
  const tempScore = calculateTempScore(temperature);

  const tsi = (0.7 * vpdScore) + (0.3 * tempScore);
  return Math.round(tsi * 10) / 10;
}
