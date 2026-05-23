const DEFAULT_PROJECT_ID = 'q8sportcar';
const DEFAULT_SITE_URL = 'https://www.q8sportcar.com';
const DEFAULT_DATABASE_URL = `https://${DEFAULT_PROJECT_ID}-default-rtdb.firebaseio.com`;
const DEFAULT_STORAGE_BUCKET = `${DEFAULT_PROJECT_ID}.firebasestorage.app`;

export const runtimeConfig = {
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    DEFAULT_SITE_URL,
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCXHGLCcYDLr8WsqFVyV5Hd2EFPDEWm_kg',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID,
    databaseUrl: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL || DEFAULT_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || DEFAULT_STORAGE_BUCKET,
  },
};

export function getSiteUrl() {
  const raw = runtimeConfig.siteUrl;
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  return `https://${raw}`;
}

export function getFirebasePublicConfig() {
  return {
    apiKey: runtimeConfig.firebase.apiKey,
    projectId: runtimeConfig.firebase.projectId,
    databaseURL: runtimeConfig.firebase.databaseUrl,
    storageBucket: runtimeConfig.firebase.storageBucket,
    authDomain: `${runtimeConfig.firebase.projectId}.firebaseapp.com`,
  };
}