import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getPrivateKey() {
  return required('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n');
}

function getDatabaseUrl() {
  return process.env.FIREBASE_DATABASE_URL || `https://${required('FIREBASE_PROJECT_ID')}-default-rtdb.firebaseio.com`;
}

const adminApp = getApps()[0] || initializeApp({
  credential: cert({
    projectId: required('FIREBASE_PROJECT_ID'),
    clientEmail: required('FIREBASE_ADMIN_CLIENT_EMAIL'),
    privateKey: getPrivateKey(),
  }),
  databaseURL: getDatabaseUrl(),
});

export const adminAuth = getAuth(adminApp);
export const adminDb = getDatabase(adminApp);