import { db } from './services/firebase';
import { calculateTSI } from './services/tsiCalculator';
import { getStatusFromTSI } from './config/thresholds';
import { checkAndSendAlerts } from './services/alertService';

const ROOM_PATH = 'room1';

console.log('Mushroom Monitoring Backend starting...');
console.log(`Listening for new readings on /${ROOM_PATH}`);

const roomRef = db.ref(ROOM_PATH);

let isInitialLoad = true;
let initialLoadCount = 0;

// Get the current count to know when initial load is complete
roomRef.once('value', (snapshot) => {
  const totalChildren = snapshot.numChildren();
  console.log(`Found ${totalChildren} existing readings. Processing...`);

  roomRef.orderByKey().on('child_added', async (snapshot) => {
    const key = snapshot.key;
    const data = snapshot.val();

    if (!key || !data) return;

    const { temperature, humidity } = data;

    if (temperature === undefined || humidity === undefined) return;

    // Skip if TSI already calculated (avoid reprocessing)
    if (data.tsi !== undefined) {
      initialLoadCount++;
      if (initialLoadCount >= totalChildren) {
        if (isInitialLoad) {
          isInitialLoad = false;
          console.log('Initial load complete. Now listening for new readings...');
        }
      }
      return;
    }

    const timestamp = parseInt(key, 10);
    const tsi = calculateTSI(temperature, humidity);
    const status = getStatusFromTSI(tsi);

    // Write TSI and status back to the reading
    await db.ref(`${ROOM_PATH}/${key}`).update({ tsi, status });

    // Update /latest node
    await db.ref('latest').set({
      temperature,
      humidity,
      tsi,
      status,
      timestamp,
    });

    // Check alerts only for new readings (not initial load)
    if (!isInitialLoad) {
      await checkAndSendAlerts(temperature, humidity, tsi, timestamp);
      console.log(
        `[NEW] Temp: ${temperature}°C | Humidity: ${humidity}% | TSI: ${tsi} | Status: ${status}`
      );
    } else {
      initialLoadCount++;
      if (initialLoadCount >= totalChildren) {
        isInitialLoad = false;
        console.log('Initial load complete. Now listening for new readings...');
      }
    }
  });
});

// /latest is what the dashboard shows. A Critical or Warning status there
// writes a row under /alerts, which is what the phone listens for.
const latestRef = db.ref('latest');
let lastAlertedStatus = '';

console.log('Watching /latest for Critical and Warning status...');
latestRef.on('value', async (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const { temperature, humidity, tsi, status, timestamp } = data;
  if (temperature === undefined || humidity === undefined || tsi === undefined) return;
  if (status !== 'Critical' && status !== 'Warning') {
    lastAlertedStatus = status || '';
    return;
  }
  if (status === lastAlertedStatus) return;

  lastAlertedStatus = status;
  await checkAndSendAlerts(temperature, humidity, tsi, timestamp);
  console.log(`[LATEST] ${status} | TSI: ${tsi} | wrote Firebase alert`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  roomRef.off();
  latestRef.off();
  process.exit(0);
});
