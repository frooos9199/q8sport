import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const DEFAULT_PROJECT_ID = 'q8sportcar';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function getProjectId() {
  return process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
}

function getPrivateKey() {
  return required('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n');
}

function getDatabaseUrl(projectId) {
  // Prefer explicit URL. Default to region-qualified host to avoid redirects/warnings.
  return (
    process.env.FIREBASE_DATABASE_URL ||
    `https://${projectId}-default-rtdb.europe-west1.firebasedatabase.app`
  );
}

function ensureAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = getProjectId();
  const databaseURL = getDatabaseUrl(projectId);

  // If GOOGLE_APPLICATION_CREDENTIALS is set, use Application Default Credentials.
  // This avoids needing FIREBASE_ADMIN_PRIVATE_KEY in the shell.
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return initializeApp({
      credential: applicationDefault(),
      databaseURL,
    });
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail: required('FIREBASE_ADMIN_CLIENT_EMAIL'),
      privateKey: getPrivateKey(),
    }),
    databaseURL,
  });
}

function digits(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

function buildCandidates(raw) {
  const base = digits(raw);
  const result = new Set();
  if (!base) return result;

  result.add(base);

  // Kuwait common case: local 8 digits -> add 965 prefix
  if (base.length === 8) {
    result.add(`965${base}`);
  }

  // Strip leading zeros if present
  if (base.length > 8 && base.startsWith('0')) {
    result.add(base.replace(/^0+/, ''));
  }

  // If already looks like +965... digits, keep as is
  return result;
}

function buildStringPhoneCandidates(digitsCandidates) {
  const result = new Set();
  for (const d of digitsCandidates) {
    result.add(d);
    if (d.startsWith('965') && d.length === 11) {
      result.add(`+${d}`);
    }
    if (d.length === 8) {
      result.add(`+965${d}`);
    }
  }
  return result;
}

function briefTitle(listing) {
  const title = listing?.title;
  if (!title) return '';
  if (typeof title === 'string') return title;
  return title?.ar || title?.en || '';
}

function printObjLine(prefix, obj) {
  const parts = [];
  if (obj?.id) parts.push(`id=${obj.id}`);
  if (obj?.title) parts.push(`title="${obj.title}"`);
  if (obj?.userName) parts.push(`name="${obj.userName}"`);
  if (obj?.userId) parts.push(`userId=${obj.userId}`);
  if (obj?.userPhone) parts.push(`phone=${obj.userPhone}`);
  if (obj?.userWhatsapp) parts.push(`wa=${obj.userWhatsapp}`);
  console.log(`${prefix} ${parts.join(' | ')}`);
}

async function queryByChild(db, path, child, value) {
  const snap = await db.ref(path).orderByChild(child).equalTo(value).get();
  return (snap.val() && typeof snap.val() === 'object') ? snap.val() : null;
}

async function findInListings(db, path, digitsCandidates, stringPhoneCandidates) {
  const found = new Map();

  // Fast path: contactDigits
  for (const d of digitsCandidates) {
    const matches = await queryByChild(db, path, 'contactDigits', d);
    if (matches) {
      Object.entries(matches).forEach(([id, listing]) => {
        found.set(`${path}/${id}`, { id, ...(listing || {}), __path: path });
      });
    }
  }

  // Fallback: stored phone strings
  for (const v of stringPhoneCandidates) {
    const [waMatches, phoneMatches] = await Promise.all([
      queryByChild(db, path, 'userWhatsapp', v),
      queryByChild(db, path, 'userPhone', v),
    ]);

    for (const matches of [waMatches, phoneMatches]) {
      if (!matches) continue;
      Object.entries(matches).forEach(([id, listing]) => {
        found.set(`${path}/${id}`, { id, ...(listing || {}), __path: path });
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

  // Try direct equals queries first
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

  // Fallback: scan users and compare digits
  if (found.size === 0) {
    const usersSnap = await db.ref('users').get();
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

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.log('Usage: node scripts/find-contact.mjs <phone_or_whatsapp_digits>');
    console.log('Example: node scripts/find-contact.mjs 66649619');
    process.exit(2);
  }

  const digitsCandidates = buildCandidates(input);
  const stringPhoneCandidates = buildStringPhoneCandidates(digitsCandidates);

  console.log('Searching for:');
  console.log(`- digits candidates: ${[...digitsCandidates].join(', ')}`);
  console.log(`- phone string candidates: ${[...stringPhoneCandidates].join(', ')}`);
  console.log('');

  ensureAdminApp();
  const db = getDatabase();

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

  for (const section of [
    ['CARS', cars],
    ['PARTS', parts],
    ['REQUESTS', requests],
  ]) {
    const [label, rows] = section;
    console.log(`\n=== ${label} ===`);
    if (!rows.length) {
      console.log('No matches');
      continue;
    }
    rows.forEach((r) => printObjLine('-', r));
  }
}

main().catch((err) => {
  console.error('ERROR:', err?.message || err);
  process.exit(1);
});
