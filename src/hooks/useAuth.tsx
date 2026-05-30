import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { ref as dbRef, serverTimestamp, set as dbSet, update } from '@react-native-firebase/database';
import { ref as storageRef } from '@react-native-firebase/storage';
import {
  AppleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { getDbSnapshot, reportRealtimeDatabaseError } from '../lib/firebaseDatabase';
import { storage } from '../lib/firebase';
import { User } from '../types';

function normalizeEmail(email: string) {
  return (email || '').trim().toLowerCase();
}

function onlyDigits(value: string) {
  return (value || '').replace(/\D+/g, '');
}

function normalizePhoneDigits(value: string) {
  const digits = onlyDigits(value);
  // Kuwait common formats: 8 digits local, or 965 + 8 digits.
  if (digits.length === 11 && digits.startsWith('965')) return digits.slice(3);
  return digits;
}

async function claimGuestListingsForUser(nextUser: Pick<User, 'uid' | 'phone' | 'whatsapp'>) {
  const phoneDigits = normalizePhoneDigits(String(nextUser.phone || ''));
  const whatsappDigits = normalizePhoneDigits(String(nextUser.whatsapp || ''));
  const candidates = new Set([phoneDigits, whatsappDigits].filter(Boolean));
  if (!candidates.size) return;

  const rootUpdates: Record<string, any> = {};

  for (const collection of ['cars', 'parts', 'requests'] as const) {
    const snap = await getDbSnapshot(dbRef(db, collection), collection, { showAlert: false });

    snap.forEach((child: any) => {
      const value = child.val();
      const listingUserId = String(value?.userId || '');
      if (!listingUserId.startsWith('guest-')) return undefined;

      const listingPhoneDigits = normalizePhoneDigits(String(value?.userPhone || ''));
      const listingWhatsappDigits = normalizePhoneDigits(String(value?.userWhatsapp || ''));
      const contactDigits = normalizePhoneDigits(String(value?.contactDigits || ''));

      const matches =
        (contactDigits && candidates.has(contactDigits)) ||
        (listingPhoneDigits && candidates.has(listingPhoneDigits)) ||
        (listingWhatsappDigits && candidates.has(listingWhatsappDigits));

      if (!matches) return undefined;

      rootUpdates[`${collection}/${child.key}/userId`] = nextUser.uid;
      return undefined;
    });
  }

  if (Object.keys(rootUpdates).length) {
    await update(dbRef(db), rootUpdates);
  }
}

function makeAppError(code: string, message: string) {
  const error: any = new Error(message);
  error.code = code;
  return error;
}

const SUPER_ADMIN_EMAILS = new Set(['summit_kw@hotmail.com']);

function isSuperAdminEmail(email?: string | null) {
  return SUPER_ADMIN_EMAILS.has(normalizeEmail(email || ''));
}

function deriveAdminFlags(input: { email?: string | null; isAdmin?: unknown; isSuperAdmin?: unknown }) {
  const emailValue = normalizeEmail(String(input.email || ''));
  const emailIsSuper = isSuperAdminEmail(emailValue);
  const recordIsSuper = input.isSuperAdmin === true;
  const isSuperAdmin = recordIsSuper || emailIsSuper;

  const recordIsAdmin = input.isAdmin === true;
  const isAdmin = recordIsAdmin || isSuperAdmin;

  return { isAdmin, isSuperAdmin };
}

function buildFallbackUser(firebaseUser: any): User {
  const flags = deriveAdminFlags({ email: firebaseUser.email });
  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || '',
    email: normalizeEmail(firebaseUser.email || ''),
    phone: '',
    whatsapp: '',
    isAdmin: flags.isAdmin,
    isSuperAdmin: flags.isSuperAdmin,
    disabled: false,
    createdAt: serverTimestamp() as any,
  };
}

async function readUserRecord(uid: string) {
  return getDbSnapshot(dbRef(db, `users/${uid}`), `users/${uid}`, { showAlert: false });
}

async function assertPhoneNotUsed(phone: string, options?: { excludeUid?: string }) {
  const phoneDigits = normalizePhoneDigits(phone);
  if (!phoneDigits) return;

  const snap = await getDbSnapshot(dbRef(db, 'users'), 'users', { showAlert: false });

  let foundUid: string | null = null;
  snap.forEach((child: any) => {
    const uid = child.key as string;
    if (options?.excludeUid && uid === options.excludeUid) return undefined;
    const value = child.val() as Partial<User> | null;
    const existingDigits = normalizePhoneDigits(String(value?.phone || ''));
    if (existingDigits && existingDigits === phoneDigits) {
      foundUid = uid;
      return true;
    }
    return undefined;
  });

  if (foundUid) {
    throw makeAppError('app/phone-already-in-use', 'phone already in use');
  }
}

type AuthContextType = {
  user: User | null;
  fbUser: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; phone: string; whatsapp: string }) => Promise<void>;
  signInWithApple: () => Promise<void>;
  updateContactInfo: (data: { phone: string; whatsapp: string }) => Promise<void>;
  adminUpdateUserContactInfo: (targetUid: string, data: { phone: string; whatsapp: string }) => Promise<void>;
  updateProfileAvatar: (fileUri: string) => Promise<void>;
  logout: () => Promise<void>;
};

async function syncUserAvatarAcrossListings(uid: string, avatar: string) {
  const rootUpdates: Record<string, any> = {};

  for (const collection of ['cars', 'parts', 'requests']) {
    const snap = await getDbSnapshot(dbRef(db, collection), collection, { showAlert: false });

    snap.forEach((child: any) => {
      const value = child.val();
      if (value?.userId === uid) {
        rootUpdates[`${collection}/${child.key}/userAvatar`] = avatar;
        rootUpdates[`${collection}/${child.key}/updatedAt`] = Date.now();
      }
      return undefined;
    });
  }

  if (Object.keys(rootUpdates).length) {
    await update(dbRef(db), rootUpdates);
  }
}

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
        const snap = await readUserRecord(u.uid);
        if (snap.exists()) {
          const existingUser = snap.val() as User;
          if (existingUser.disabled) {
            await signOut(auth as any);
            setUser(null);
            setLoading(false);
            clearTimeout(safetyTimeout);
            return;
          }

          const flags = deriveAdminFlags({
            email: existingUser.email || u.email || '',
            isAdmin: existingUser.isAdmin,
            isSuperAdmin: existingUser.isSuperAdmin,
          });

          // Ensure super-admin is persisted for the super-admin email(s), so RTDB rules can enforce privileges.
          if (flags.isSuperAdmin && !existingUser.isSuperAdmin) {
            void update(dbRef(db, `users/${u.uid}`), {
              isSuperAdmin: true,
              isAdmin: true,
              updatedAt: Date.now(),
            }).catch(() => {
              // Best-effort; ignore failures.
            });
          }

          setUser({
            ...existingUser,
            ...flags,
            disabled: Boolean(existingUser.disabled),
          });
        } else {
          const fallback = buildFallbackUser(u);

          // Best-effort: create missing user record so app screens can work.
          try {
            await dbSet(dbRef(db, `users/${u.uid}`), fallback);
          } catch {
            // ignore (likely permissions) and still keep fallback in local state
          }

          setUser(fallback);
        }
      } catch (error) {
        reportRealtimeDatabaseError(`users/${u.uid}`, error, false);
        setUser(buildFallbackUser(u));
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
    const credential = await signInWithEmailAndPassword(auth as any, normalizeEmail(email), password);
    const snap = await readUserRecord(credential.user.uid);
    const existingUser = snap.exists() ? (snap.val() as Partial<User>) : null;

    if (existingUser?.disabled) {
      await signOut(auth as any);
      throw new Error('user-disabled-by-admin');
    }
  };

  const upsertUserRecord = async (
    firebaseUser: any,
    fallbackData?: { name?: string; email?: string },
  ) => {
    const userRef = dbRef(db, `users/${firebaseUser.uid}`);
    const fallbackName = (fallbackData?.name || firebaseUser.displayName || '').trim();
    const fallbackEmail = normalizeEmail(fallbackData?.email || firebaseUser.email || '');

    let existingData: Partial<User> | null = null;

    try {
      const existingSnap = await getDbSnapshot(userRef, `users/${firebaseUser.uid}`, { showAlert: false });
      existingData = existingSnap.exists() ? (existingSnap.val() as Partial<User>) : null;
    } catch (error) {
      reportRealtimeDatabaseError(`users/${firebaseUser.uid}`, error, false);
    }

    if (existingData?.disabled) {
      await signOut(auth as any);
      throw new Error('user-disabled-by-admin');
    }

    const userData: User = {
      uid: firebaseUser.uid,
      name: existingData?.name || fallbackName,
      email: existingData?.email || fallbackEmail,
      phone: existingData?.phone || '',
      whatsapp: existingData?.whatsapp || '',
      phoneDigits: normalizePhoneDigits(String(existingData?.phone || '')),
      whatsappDigits: normalizePhoneDigits(String(existingData?.whatsapp || '')),
      ...deriveAdminFlags({ email: existingData?.email || fallbackEmail, isAdmin: existingData?.isAdmin, isSuperAdmin: (existingData as any)?.isSuperAdmin }),
      disabled: Boolean(existingData?.disabled),
      avatar: existingData?.avatar,
      createdAt: existingData?.createdAt || (serverTimestamp() as any),
    };

    try {
      await dbSet(userRef, userData);
    } catch (error) {
      reportRealtimeDatabaseError(`users/${firebaseUser.uid}`, error, false);
    }

    setUser(userData);
  };

  const register = async (data: { email: string; password: string; name: string; phone: string; whatsapp: string }) => {
    const normalizedEmail = normalizeEmail(data.email);

    // Enforce phone uniqueness across real accounts only (users/*).
    // Guest/manual listings do not create users records, so they never block registration.
    await assertPhoneNotUsed(data.phone);

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
      phoneDigits: normalizePhoneDigits(data.phone),
      whatsappDigits: normalizePhoneDigits(data.whatsapp),
      ...deriveAdminFlags({ email: normalizedEmail }),
      createdAt: serverTimestamp() as any,
    };

    try {
      await dbSet(dbRef(db, `users/${cred.user.uid}`), userData);
    } catch (error) {
      reportRealtimeDatabaseError(`users/${cred.user.uid}`, error, false);
    }

    setUser(userData);

    void claimGuestListingsForUser(userData).catch(() => {
      // Best-effort claim; ignore failures (rules/network) to avoid blocking registration.
    });
  };

  const signInWithApple = async () => {
    const appleResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    if (!appleResponse.identityToken) {
      throw new Error('apple-auth-no-token');
    }

    const credential = AppleAuthProvider.credential(appleResponse.identityToken, appleResponse.nonce);
    const result = await signInWithCredential(auth as any, credential as any);

    const fullName = [appleResponse.fullName?.givenName, appleResponse.fullName?.familyName]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (fullName && !result.user.displayName) {
      try {
        await updateProfile(result.user as any, { displayName: fullName });
      } catch {
        // Ignore non-fatal profile sync issues.
      }
    }

    await upsertUserRecord(result.user, {
      name: fullName,
      email: appleResponse.email || result.user.email || '',
    });
  };

  const updateContactInfo = async (data: { phone: string; whatsapp: string }) => {
    if (!user) {
      throw new Error('user-not-found');
    }

    const sanitizedPhone = data.phone.trim();
    const sanitizedWhatsapp = data.whatsapp.trim();

    await assertPhoneNotUsed(sanitizedPhone, { excludeUid: user.uid });

    const nextUser: User = {
      ...user,
      phone: sanitizedPhone,
      whatsapp: sanitizedWhatsapp,
      phoneDigits: normalizePhoneDigits(sanitizedPhone),
      whatsappDigits: normalizePhoneDigits(sanitizedWhatsapp),
    };

    try {
      await update(dbRef(db, `users/${user.uid}`), {
        phone: sanitizedPhone,
        whatsapp: sanitizedWhatsapp,
        phoneDigits: normalizePhoneDigits(sanitizedPhone),
        whatsappDigits: normalizePhoneDigits(sanitizedWhatsapp),
        updatedAt: Date.now(),
      });
    } catch (error) {
      reportRealtimeDatabaseError(`users/${user.uid}`, error, false);
      throw error;
    }

    setUser(nextUser);

    void claimGuestListingsForUser(nextUser).catch(() => {
      // Best-effort claim; ignore failures.
    });
  };

  const adminUpdateUserContactInfo = async (targetUid: string, data: { phone: string; whatsapp: string }) => {
    if (!user) {
      throw new Error('user-not-found');
    }

    if (!user.isAdmin && !user.isSuperAdmin) {
      throw new Error('not-authorized');
    }

    const uid = String(targetUid || '').trim();
    if (!uid) {
      throw new Error('target-user-not-found');
    }

    const sanitizedPhone = String(data.phone || '').trim();
    const sanitizedWhatsapp = String(data.whatsapp || '').trim();

    await assertPhoneNotUsed(sanitizedPhone, { excludeUid: uid });

    const rootUpdates: Record<string, any> = {
      [`users/${uid}/phone`]: sanitizedPhone,
      [`users/${uid}/whatsapp`]: sanitizedWhatsapp,
      [`users/${uid}/phoneDigits`]: normalizePhoneDigits(sanitizedPhone),
      [`users/${uid}/whatsappDigits`]: normalizePhoneDigits(sanitizedWhatsapp),
      [`users/${uid}/updatedAt`]: Date.now(),
    };

    try {
      await update(dbRef(db), rootUpdates);
    } catch (error) {
      reportRealtimeDatabaseError(`users/${uid}`, error, false);
      throw error;
    }

    if (uid === user.uid) {
      const nextUser: User = {
        ...user,
        phone: sanitizedPhone,
        whatsapp: sanitizedWhatsapp,
        phoneDigits: normalizePhoneDigits(sanitizedPhone),
        whatsappDigits: normalizePhoneDigits(sanitizedWhatsapp),
      };
      setUser(nextUser);
      void claimGuestListingsForUser(nextUser).catch(() => {
        // Best-effort claim; ignore failures.
      });
    }
  };

  const updateProfileAvatar = async (fileUri: string) => {
    if (!user) {
      throw new Error('user-not-found');
    }

    const cleanUri = fileUri.replace('file://', '');
    const avatarRef = storageRef(storage, `users/${user.uid}/avatar-${Date.now()}.jpg`);

    await avatarRef.putFile(cleanUri);
    const avatarUrl = await avatarRef.getDownloadURL();

    try {
      await update(dbRef(db, `users/${user.uid}`), {
        avatar: avatarUrl,
        updatedAt: Date.now(),
      });
      await syncUserAvatarAcrossListings(user.uid, avatarUrl);
    } catch (error) {
      reportRealtimeDatabaseError(`users/${user.uid}`, error, false);
      throw error;
    }

    setUser({
      ...user,
      avatar: avatarUrl,
    });
  };

  const logout = async () => {
    await signOut(auth as any);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, fbUser, loading, login, register, signInWithApple, updateContactInfo, adminUpdateUserContactInfo, updateProfileAvatar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
