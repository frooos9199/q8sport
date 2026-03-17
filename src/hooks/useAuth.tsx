import React, { createContext, useContext, useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { User, ADMIN_EMAILS } from '../types';

type AuthContextType = {
  user: User | null;
  fbUser: FirebaseAuthTypes.User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone: string; whatsapp: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [fbUser, setFbUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(async (u) => {
      setFbUser(u);
      if (u) {
        const doc = await firestore().collection('users').doc(u.uid).get();
        if (doc.exists) {
          setUser(doc.data() as User);
          setIsAdmin(ADMIN_EMAILS.includes(u.email || ''));
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    await auth().signInWithEmailAndPassword(email, password);
  };

  const register = async (data: { email: string; password: string; name: string; phone: string; whatsapp: string }) => {
    const cred = await auth().createUserWithEmailAndPassword(data.email, data.password);
    const userData: User = {
      uid: cred.user.uid,
      name: data.name,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    await firestore().collection('users').doc(cred.user.uid).set(userData);
    setUser(userData);
    setIsAdmin(ADMIN_EMAILS.includes(data.email));
  };

  const logout = async () => {
    await auth().signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, fbUser, loading, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
