import { getApp, getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "q8sportcar";
const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCXHGLCcYDLr8WsqFVyV5Hd2EFPDEWm_kg";

const firebaseConfig = {
  apiKey,
  authDomain: `${projectId}.firebaseapp.com`,
  databaseURL,
  projectId,
  storageBucket,
};

export function canUseFirebaseStorage() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.storageBucket);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const storage = getStorage(app);