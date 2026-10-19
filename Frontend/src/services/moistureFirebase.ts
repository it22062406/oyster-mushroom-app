import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, query, orderByKey, startAt, limitToLast } from 'firebase/database';

import { MOISTURE_FIREBASE_CONFIG } from '@/constants/moistureConstants';

const app = initializeApp(MOISTURE_FIREBASE_CONFIG);
const database = getDatabase(app);

export { database, ref, onValue, query, orderByKey, startAt, limitToLast };
export default app;
