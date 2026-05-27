const DEFAULT_API_KEY = 'AIzaSyCXHGLCcYDLr8WsqFVyV5Hd2EFPDEWm_kg';
const DEFAULT_PROJECT_ID = 'q8sportcar';
const DEFAULT_DATABASE_URL = 'https://q8sportcar-default-rtdb.europe-west1.firebasedatabase.app';

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      args[key] = 'true';
      continue;
    }

    args[key] = value;
    index += 1;
  }

  return args;
}

function required(value, label) {
  if (!value) {
    throw new Error(`Missing required value: ${label}`);
  }

  return value;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || `Request failed with status ${response.status}`);
  }

  return response.json();
}

async function putJson(url, body) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error || `Request failed with status ${response.status}`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  return payload;
}

async function ensureUser({ apiKey, databaseUrl, email, password, name, phone, whatsapp }) {
  const normalizedEmail = email.trim().toLowerCase();
  const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
  const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const updateUrl = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`;

  let authPayload;
  let created = false;

  try {
    authPayload = await postJson(signUpUrl, {
      email: normalizedEmail,
      password,
      returnSecureToken: true,
    });
    created = true;
  } catch (error) {
    if (!String(error.message).includes('EMAIL_EXISTS')) {
      throw error;
    }

    authPayload = await postJson(signInUrl, {
      email: normalizedEmail,
      password,
      returnSecureToken: true,
    });
  }

  if (name) {
    await postJson(updateUrl, {
      idToken: authPayload.idToken,
      displayName: name,
      returnSecureToken: false,
    });
  }

  const userUrl = `${databaseUrl.replace(/\/$/, '')}/users/${authPayload.localId}.json?auth=${authPayload.idToken}`;
  const existingRecord = await getJson(userUrl).catch(() => null);

  const userRecord = {
    uid: authPayload.localId,
    name: existingRecord?.name || name || 'App Store Review',
    email: normalizedEmail,
    phone: existingRecord?.phone || phone || '',
    whatsapp: existingRecord?.whatsapp || whatsapp || '',
    isAdmin: Boolean(existingRecord?.isAdmin),
    disabled: Boolean(existingRecord?.disabled),
    avatar: existingRecord?.avatar || '',
    createdAt: existingRecord?.createdAt || Date.now(),
  };

  await putJson(userUrl, userRecord);

  return {
    created,
    uid: authPayload.localId,
    email: normalizedEmail,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const email = required(args.email, '--email');
  const password = required(args.password, '--password');
  const name = args.name || 'App Store Review';
  const phone = args.phone || '';
  const whatsapp = args.whatsapp || '';
  const apiKey = process.env.FIREBASE_API_KEY || DEFAULT_API_KEY;
  const projectId = process.env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
  const databaseUrl = process.env.FIREBASE_DATABASE_URL || DEFAULT_DATABASE_URL;

  const result = await ensureUser({
    apiKey,
    databaseUrl,
    projectId,
    email,
    password,
    name,
    phone,
    whatsapp,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});