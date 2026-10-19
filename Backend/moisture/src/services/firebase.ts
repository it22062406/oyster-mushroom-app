import * as admin from 'firebase-admin';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
const databaseURL = process.env.FIREBASE_DATABASE_URL;

if (!databaseURL) {
  console.error('FIREBASE_DATABASE_URL is not set in .env');
  process.exit(1);
}

const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL,
});

export const db = admin.database();
export default admin;
