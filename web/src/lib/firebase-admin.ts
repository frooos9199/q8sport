import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';

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

function getStorageBucket() {
  return process.env.FIREBASE_STORAGE_BUCKET || `${required('FIREBASE_PROJECT_ID')}.firebasestorage.app`;
}

let adminApp: App | null = null;

export function getAdminApp() {
  if (adminApp) {
    return adminApp;
  }

  adminApp = getApps()[0] || initializeApp({
    credential: cert({
      projectId: required('FIREBASE_PROJECT_ID'),
      clientEmail: required('FIREBASE_ADMIN_CLIENT_EMAIL'),
      privateKey: getPrivateKey(),
    }),
    databaseURL: getDatabaseUrl(),
    storageBucket: getStorageBucket(),
  });

  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getDatabase(getAdminApp());
}

export function getAdminStorageBucket() {
  return getStorage(getAdminApp()).bucket();
}