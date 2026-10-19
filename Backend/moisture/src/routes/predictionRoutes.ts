import { Router } from 'express';
import { predictTsi } from '../controllers/predictionController';

const router = Router();

router.post('/predict', predictTsi);

export default router;
