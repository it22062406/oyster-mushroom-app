import dotenv from 'dotenv';
import express from 'express';
import predictionRoutes from './routes/predictionRoutes';

dotenv.config();

const app = express();
app.use(express.json());

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.options(/.*/, (_req, res) => {
  res.sendStatus(204);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(predictionRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mushroom prediction API listening on port ${PORT}`);
});
