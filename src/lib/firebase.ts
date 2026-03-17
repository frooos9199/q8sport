import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCmtlQSl1_5nKz7BHUD0ntOLEC9_4zcHxo",
  authDomain: "q8sportcar.firebaseapp.com",
  projectId: "q8sportcar",
  storageBucket: "q8sportcar.firebasestorage.app",
  messagingSenderId: "510621587144",
  appId: "1:510621587144:web:8d63dc54627c8704ab37fd",
  measurementId: "G-9THNV3GLPN",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
