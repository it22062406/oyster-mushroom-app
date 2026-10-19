# Oyster Mushroom Farm

Mobile app and APIs for an oyster mushroom farm. The app covers account login, disease detection from bag photos, moisture-stress monitoring, and CO₂ rack monitoring.

## What it does

- **Accounts.** Register, log in, and reset a password. Accounts are stored in SQLite.
- **Disease detection.** Photograph a mushroom bag. A YOLOv8 model looks for green mold (Trichoderma) and black mold (Aspergillus). Results can be saved against a rack and bag, then viewed in history, tracking, and PDF or CSV reports.
- **Moisture stress.** Live temperature and humidity readings come from Firebase Realtime Database (`/room1`). A listener computes a Temperature Stress Index (TSI) and writes alerts. A separate API predicts the next TSI from the last four readings.
- **CO₂ monitoring.** Rack, sensor, and capture screens in the app. Those screens call sensor routes on port 8000 that are not implemented in the current API, so that section will not load live data until those routes exist.
- **Growth stage.** Opens an external web tool from the home screen.

## Layout

```
Frontend/            Expo app (SDK 57), opened in Expo Go
Backend/             Disease detection and accounts (FastAPI, port 8000)
Backend/moisture/    Moisture listener and TSI prediction API (port 3000)
model/               Dataset prep and YOLOv8 training scripts
```

Disease weights are loaded from `Model/weights/best.pt` (same folder as `model/` on macOS). The API still starts if that file is missing. `/predict` fails until the file is there.

## Requirements

- Node.js 22 or newer
- Python 3.12
- Expo Go **SDK 57** on the phone (the project is Expo SDK 57)
- For a physical phone: the phone and this computer on the same network

## Setup

### Disease detection API

```bash
cd Backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Place the trained weights at `Model/weights/best.pt`.

### Moisture service

```bash
cd Backend/moisture
npm install
```

`Backend/moisture/.env` must set:

```
PORT=3000
FIREBASE_DATABASE_URL=https://<your-project>.firebasedatabase.app
FIREBASE_SERVICE_ACCOUNT_PATH=./your-service-account.json
```

Keep the service-account JSON on this machine only. Do not commit it.

### App

```bash
cd Frontend
npm install
```

`Frontend/.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

On a phone, `localhost` is rewritten to the computer running Metro, so the disease API is reachable without editing this file. The moisture API uses the same host on port 3000.

## Run

Use three terminals.

**1. Disease API**

```bash
cd Backend
source .venv/bin/activate
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

**2. Moisture**

Prediction API:

```bash
cd Backend/moisture
npm run dev:api
```

Firebase listener (TSI and alerts for new `/room1` readings):

```bash
cd Backend/moisture
npm run dev
```

**3. App**

```bash
cd Frontend
npx expo start
```

Run this from `Frontend`. The repo root has no Expo `package.json`.

- **Expo Go on a phone:** enter `exp://<this-computer-lan-ip>:8081`. This Mac's hotspot or USB tether address has been `172.20.10.6`.
- **Android emulator:** `npx expo start --android`. The emulator reaches this computer at `10.0.2.2`.
- **Web:** press `w` in the Expo terminal, or run `npm run web`.

If Expo Go says you are signed in as a user but the CLI is not, run `npx expo login` inside `Frontend` and sign in as that same account.

## Disease API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Service and model status |
| POST | `/auth/register` | Create an account (`name`, `email`, `phone`, `password`) |
| POST | `/auth/login` | Sign in (`email`, `password`) |
| POST | `/auth/reset-password` | Set a new password (`email`, `new_password`) |
| POST | `/predict` | Upload an image and return detections |
| GET | `/racks` | List racks |
| GET | `/rack/{rack_id}` | Rack detail and latest bag status |
| POST | `/bag` | Save a detection |
| GET | `/history` | Paginated detections |
| GET | `/history/{id}` | One detection |
| DELETE | `/history/{id}` | Delete a detection |
| GET | `/reports/summary` | Counts |
| GET | `/reports/pdf` | PDF report |
| GET | `/reports/excel` | CSV export |
| GET | `/outputs/<file>` | Annotated image |

Accounts live in `Backend/oyster.db`.

## Train the disease model

Scripts in `model/`:

1. `01_inspect_datasets.py`
2. `02_prepare_dataset.py`
3. `03_train.py` — YOLOv8 nano (`n`) or small (`s`)

Copy the best checkpoint to `Model/weights/best.pt` and restart the disease API.

## Moisture data

- Readings: Firebase `/room1` (`temperature`, `humidity`).
- Alerts: Firebase `/alerts`.
- Prediction: `POST /predict` on port 3000 with at least four readings, oldest first:

```json
{
  "readings": [
    { "timestamp": "2026-10-16 08:00:00", "temperature_c": 24.1, "humidity_percent": 80 }
  ]
}
```

The response includes `currentTsi` and `predictedTsi`.
