# Moisture Stress Monitoring

This is the moisture part of the oyster mushroom farm app: the Expo screens that show live conditions, and the Node backend that scores those conditions and predicts the next Temperature Stress Index (TSI).

## What it does

Sensor readings are stored in Firebase Realtime Database at `/room1`. Each reading has `temperature` and `humidity`.

- The **listener** (`npm run dev`) watches `/room1`. For each new reading it calculates TSI, writes `tsi` and `status` back onto that reading, and pushes an alert to `/alerts` when temperature, humidity, or TSI crosses a threshold.
- The **prediction API** (`npm run dev:api`, port 3000) accepts the last four readings and returns the current TSI and a predicted next TSI.
- The **app** shows the latest reading, a TSI chart, a status badge, the prediction, and the alert list. A new Firebase alert can also raise a phone notification.

TSI labels:

| TSI | Status |
| --- | --- |
| 0–25 | Excellent |
| 26–50 | Good |
| 51–70 | Warning |
| 71–100 | Critical |

Alert thresholds live in `src/config/thresholds.ts`. Temperature alerts at 18°C and 32°C. Humidity alerts at 65% and 98%. TSI warning at 50, critical at 70.

## Layout in this zip

```
frontend/screens/moisture/          Dashboard and alerts screens
frontend/components/moisture/       Cards, chart, banner
frontend/services/                  Firebase client and prediction API client
frontend/constants/                 Colors, Firebase web config, API host
frontend/navigation/MoistureTabs.tsx
backend/                            Listener, prediction API, TSI model
```

In the full app, `MoistureTabs` is the `MoistureMonitoring` screen. The home screen opens it with the Moisture Stress Monitoring tile.

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Set `.env`:

```
PORT=3000
FIREBASE_DATABASE_URL=https://<your-project>.firebasedatabase.app
FIREBASE_SERVICE_ACCOUNT_PATH=./your-service-account.json
```

Put the Firebase service-account JSON next to `package.json`. That file is not in this zip.

Start the prediction API:

```bash
npm run dev:api
```

`GET /health` returns `{ "status": "ok" }`.

Start the listener in a second terminal:

```bash
npm run dev
```

### Predict

`POST /predict` needs at least four readings, oldest first.

```json
{
  "readings": [
    { "timestamp": "2026-10-16 08:00:00", "temperature_c": 24.0, "humidity_percent": 82 },
    { "timestamp": "2026-10-16 08:10:00", "temperature_c": 24.2, "humidity_percent": 83 },
    { "timestamp": "2026-10-16 08:20:00", "temperature_c": 24.4, "humidity_percent": 84 },
    { "timestamp": "2026-10-16 08:30:00", "temperature_c": 24.6, "humidity_percent": 85 }
  ]
}
```

The response includes `currentTsi` and `predictedTsi`.

## Frontend

These files belong inside the Expo app (`Frontend/`). They use the `@/` import alias, Expo SDK 57, Firebase JS, `react-native-chart-kit`, and `expo-notifications`.

The phone calls the prediction API at port 3000 on the computer that is running Metro. On an Android emulator that host is `10.0.2.2`.

Firebase client config is in `frontend/constants/moistureConstants.ts`.
