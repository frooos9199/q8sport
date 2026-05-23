import { getApp, getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

import { getFirebasePublicConfig } from "@/lib/runtime-config";

const firebaseConfig = getFirebasePublicConfig();

export function canUseFirebaseStorage() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.storageBucket);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const storage = getStorage(app);