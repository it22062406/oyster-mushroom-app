import { Request, Response } from 'express';
import { predictNextTSI } from '../services/predictionService';

/**
 * POST /predict
 * Body: { readings: [{ timestamp, temperature_c, humidity_percent }, ...] }
 * (4 readings minimum, oldest first — 3 history + 1 current)
 *
 * Returns the current reading's TSI alongside the model's predicted TSI,
 * for the mobile app to display.
 */
export function predictTsi(req: Request, res: Response): void {
  const { readings } = req.body ?? {};

  try {
    const result = predictNextTSI(readings);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid input.' });
  }
}
