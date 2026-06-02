import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, get, query, orderByChild, equalTo } from 'firebase/database';

function digits(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

function buildCandidates(raw) {
  const base = digits(raw);
  const result = new Set();
  if (!base) return result;

  result.add(base);
  if (base.length === 8) result.add(`965${base}`);
  if (base.length > 8 && base.startsWith('0')) result.add(base.replace(/^0+/, ''));

  return result;
}

function buildStringPhoneCandidates(digitsCandidates) {
  const result = new Set();
  for (const d of digitsCandidates) {
    result.add(d);
    if (d.length === 8) result.add(`+965${d}`);
    if (d.startsWith('965') && d.length === 11) result.add(`+${d}`);
  }
  return result;
}

function briefTitle(listing) {
  const title = listing?.title;
  if (!title) return '';
  if (typeof title === 'string') return title;
  return title?.ar || title?.en || '';
}

function getFirebasePublicConfig() {
  const DEFAULT_PROJECT_ID = 'q8sportcar';
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCXHGLCcYDLr8WsqFVyV5Hd2EFPDEWm_kg';
  const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

  return {
    apiKey,
    projectId,
    databaseURL,
    storageBucket,
    authDomain: `${projectId}.firebaseapp.com`,
  };
}

async function queryByChild(db, path, child, value) {
  const q = query(ref(db, path), orderByChild(child), equalTo(value));
  const snap = await get(q);
  return (snap.exists() && typeof snap.val() === 'object') ? snap.val() : null;
}

async function findInListings(db, path, digitsCandidates, stringPhoneCandidates) {
  const found = new Map();

  for (const d of digitsCandidates) {
    const matches = await queryByChild(db, path, 'contactDigits', d);
    if (matches) {
      Object.entries(matches).forEach(([id, listing]) => {
        found.set(`${path}/${id}`, { id, ...(listing || {}) });
      });
    }
  }

  for (const v of stringPhoneCandidates) {
    const [waMatches, phoneMatches] = await Promise.all([
      queryByChild(db, path, 'userWhatsapp', v),
      queryByChild(db, path, 'userPhone', v),
    ]);

    for (const matches of [waMatches, phoneMatches]) {
      if (!matches) continue;
      Object.entries(matches).forEach(([id, listing]) => {
        found.set(`${path}/${id}`, { id, ...(listing || {}) });
      });
    }
  }

  return [...found.values()].map((listing) => ({
    path,
    id: listing.id,
    title: briefTitle(listing),
    userName: listing.userName,
    userId: listing.userId,
    userPhone: listing.userPhone,
    userWhatsapp: listing.userWhatsapp,
  }));
}

async function findInUsers(db, digitsCandidates, stringPhoneCandidates) {
  const found = new Map();

  for (const v of stringPhoneCandidates) {
    const [waMatches, phoneMatches] = await Promise.all([
      queryByChild(db, 'users', 'whatsapp', v),
      queryByChild(db, 'users', 'phone', v),
    ]);

    for (const matches of [waMatches, phoneMatches]) {
      if (!matches) continue;
      Object.entries(matches).forEach(([uid, user]) => {
        found.set(uid, { uid, ...(user || {}) });
      });
    }
  }

  if (found.size === 0) {
    const usersSnap = await get(ref(db, 'users'));
    const users = usersSnap.val() || {};
    const candidates = new Set(digitsCandidates);

    Object.entries(users).forEach(([uid, user]) => {
      const phoneDigits = digits(user?.phone);
      const waDigits = digits(user?.whatsapp);
      for (const c of candidates) {
        if (c && (phoneDigits.endsWith(c) || waDigits.endsWith(c) || phoneDigits === c || waDigits === c)) {
          found.set(uid, { uid, ...(user || {}) });
          break;
        }
      }
    });
  }

  return [...found.values()].map((u) => ({
    uid: u.uid,
    name: u.name,
    email: u.email,
    phone: u.phone,
    whatsapp: u.whatsapp,
    disabled: u.disabled,
    isAdmin: u.isAdmin,
    isSuperAdmin: u.isSuperAdmin,
  }));
}

function printRow(prefix, obj) {
  const parts = [];
  if (obj?.id) parts.push(`id=${obj.id}`);
  if (obj?.title) parts.push(`title="${obj.title}"`);
  if (obj?.userName) parts.push(`name="${obj.userName}"`);
  if (obj?.userId) parts.push(`userId=${obj.userId}`);
  if (obj?.userPhone) parts.push(`phone=${obj.userPhone}`);
  if (obj?.userWhatsapp) parts.push(`wa=${obj.userWhatsapp}`);
  console.log(`${prefix} ${parts.join(' | ')}`);
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.log('Usage: node scripts/find-contact-public.mjs <phone_or_whatsapp_digits>');
    console.log('Example: node scripts/find-contact-public.mjs 66649619');
    process.exit(2);
  }

  const digitsCandidates = buildCandidates(input);
  const stringPhoneCandidates = buildStringPhoneCandidates(digitsCandidates);

  console.log('Searching for:');
  console.log(`- digits candidates: ${[...digitsCandidates].join(', ')}`);
  console.log(`- phone string candidates: ${[...stringPhoneCandidates].join(', ')}`);
  console.log('');

  const config = getFirebasePublicConfig();
  const app = getApps().length ? getApp() : initializeApp(config);
  const db = getDatabase(app, config.databaseURL);

  const [users, cars, parts, requests] = await Promise.all([
    findInUsers(db, digitsCandidates, stringPhoneCandidates),
    findInListings(db, 'cars', digitsCandidates, stringPhoneCandidates),
    findInListings(db, 'parts', digitsCandidates, stringPhoneCandidates),
    findInListings(db, 'requests', digitsCandidates, stringPhoneCandidates),
  ]);

  console.log('=== USERS ===');
  if (!users.length) console.log('No matches');
  users.forEach((u) => {
    console.log(`- uid=${u.uid} | name="${u.name || ''}" | wa=${u.whatsapp || ''} | phone=${u.phone || ''} | disabled=${Boolean(u.disabled)} | admin=${Boolean(u.isAdmin)} | super=${Boolean(u.isSuperAdmin)}`);
  });

  for (const [label, rows] of [
    ['CARS', cars],
    ['PARTS', parts],
    ['REQUESTS', requests],
  ]) {
    console.log(`\n=== ${label} ===`);
    if (!rows.length) {
      console.log('No matches');
      continue;
    }
    rows.forEach((r) => printRow('-', r));
  }
}

main().catch((err) => {
  console.error('ERROR:', err?.message || err);
  process.exit(1);
});
