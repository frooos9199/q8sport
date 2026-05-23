import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { get, ref as dbRef, serverTimestamp, set as dbSet } from '@react-native-firebase/database';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@react-native-firebase/auth';
import { User } from '../types';

function normalizeEmail(email: string) {
  return (email || '').trim().toLowerCase();
}

type AuthContextType = {
  user: User | null;
  fbUser: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone: string; whatsapp: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [fbUser, setFbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety net: never block the entire app on auth init forever.
    // If Firebase auth fails to initialize (misconfig, native issue), we still show the app UI.
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 4000);

    const unsub = onAuthStateChanged(auth as any, async (u: any) => {
      setFbUser(u);
      if (!u) {
        setUser(null);
        setLoading(false);
        clearTimeout(safetyTimeout);
        return;
      }

      try {
        const snap = await get(dbRef(db, `users/${u.uid}`));
        if (snap.exists()) {
          setUser(snap.val() as User);
        } else {
          const fallback: User = {
            uid: u.uid,
            name: u.displayName || '',
            email: normalizeEmail(u.email || ''),
            phone: '',
            whatsapp: '',
            createdAt: serverTimestamp() as any,
          };

          // Best-effort: create missing user record so app screens can work.
          try {
            await dbSet(dbRef(db, `users/${u.uid}`), fallback);
          } catch {
            // ignore (likely permissions) and still keep fallback in local state
          }

          setUser(fallback);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    });
    return () => {
      clearTimeout(safetyTimeout);
      unsub();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth as any, normalizeEmail(email), password);
  };

  const register = async (data: { email: string; password: string; name: string; phone: string; whatsapp: string }) => {
    const normalizedEmail = normalizeEmail(data.email);
    const cred = await createUserWithEmailAndPassword(auth as any, normalizedEmail, data.password);

    try {
      await updateProfile(cred.user as any, { displayName: data.name });
    } catch {
      // Non-fatal: some environments may fail profile update; app can still work.
    }

    const userData: User = {
      uid: cred.user.uid,
      name: data.name,
      email: normalizedEmail,
      phone: data.phone,
      whatsapp: data.whatsapp,
      createdAt: serverTimestamp() as any,
    };
    await dbSet(dbRef(db, `users/${cred.user.uid}`), userData);
    setUser(userData);
  };

  const logout = async () => {
    await signOut(auth as any);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, fbUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
