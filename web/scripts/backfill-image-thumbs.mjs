#!/usr/bin/env node

import { randomUUID } from 'node:crypto';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getStorage } from 'firebase-admin/storage';
import sharp from 'sharp';

const DEFAULT_COLLECTIONS = ['cars', 'parts', 'requests'];
const THUMBNAIL_SIZE = 480;
const THUMBNAIL_QUALITY = 65;

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function getDatabaseUrl(projectId) {
  return process.env.FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`;
}

function getStorageBucket(projectId) {
  return process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;
}

function parseArgs(argv) {
  const options = {
    collections: [],
    dryRun: true,
    limit: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--write') {
      options.dryRun = false;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--collection' || arg === '--collections') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${arg} يحتاج قيمة مثل cars,parts,requests`);
      }
      options.collections = value.split(',').map(item => item.trim()).filter(Boolean);
      index += 1;
      continue;
    }

    if (arg === '--limit') {
      const value = Number(argv[index + 1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error('--limit يحتاج رقمًا صحيحًا أكبر من صفر');
      }
      options.limit = value;
      index += 1;
      continue;
    }

    throw new Error(`خيار غير معروف: ${arg}`);
  }

  options.collections = options.collections.length ? options.collections : DEFAULT_COLLECTIONS;
  return options;
}

function printHelp() {
  console.log(`
Backfill imageThumbs for old listings.

Usage:
  node scripts/backfill-image-thumbs.mjs [--dry-run] [--write] [--collection cars,parts,requests] [--limit 20]

Notes:
  --dry-run  default mode, prints what would be updated without writing.
  --write    uploads generated thumbs and writes imageThumbs to Realtime Database.
  --limit    optional max number of listings to migrate per collection.
`);
}

function createAdminApp() {
  const projectId = required('FIREBASE_PROJECT_ID');
  const clientEmail = required('FIREBASE_ADMIN_CLIENT_EMAIL');
  const privateKey = required('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n');
  const databaseURL = getDatabaseUrl(projectId);
  const storageBucket = getStorageBucket(projectId);

  const app = getApps()[0] || initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    databaseURL,
    storageBucket,
  });

  return { app, projectId, storageBucket };
}

function buildDownloadUrl(bucketName, objectPath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

async function fetchImageBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`فشل تنزيل الصورة: ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function createThumbnailBuffer(url) {
  const source = await fetchImageBuffer(url);
  return sharp(source)
    .rotate()
    .resize({
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: THUMBNAIL_QUALITY, mozjpeg: true })
    .toBuffer();
}

async function uploadThumbnail(bucket, bucketName, collection, listingId, imageIndex, imageUrl) {
  const token = randomUUID();
  const objectPath = `${collection}/${listingId}/migration-thumb-${imageIndex}.jpg`;
  const file = bucket.file(objectPath);
  const buffer = await createThumbnailBuffer(imageUrl);

  await file.save(buffer, {
    resumable: false,
    contentType: 'image/jpeg',
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  return buildDownloadUrl(bucketName, objectPath, token);
}

async function migrateCollection({ db, bucket, bucketName, collection, dryRun, limit }) {
  const snap = await db.ref(collection).get();

  if (!snap.exists()) {
    console.log(`- ${collection}: لا توجد بيانات`);
    return;
  }

  const rows = Object.entries(snap.val() || {});
  let scanned = 0;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const [listingId, value] of rows) {
    const listing = value || {};
    const images = Array.isArray(listing.images) ? listing.images.filter(Boolean) : [];
    const existingThumbs = Array.isArray(listing.imageThumbs) ? [...listing.imageThumbs] : [];

    if (!images.length) {
      skipped += 1;
      continue;
    }

    if (limit && migrated >= limit) {
      break;
    }

    scanned += 1;
    const nextThumbs = [...existingThumbs];
    let changed = false;

    try {
      for (let index = 0; index < images.length; index += 1) {
        if (nextThumbs[index]) continue;

        changed = true;

        if (dryRun) {
          nextThumbs[index] = `[dry-run] ${collection}/${listingId}#${index}`;
          continue;
        }

        nextThumbs[index] = await uploadThumbnail(bucket, bucketName, collection, listingId, index, images[index]);
      }

      if (!changed) {
        skipped += 1;
        continue;
      }

      if (dryRun) {
        console.log(`  would update ${collection}/${listingId} (${images.length} images)`);
      } else {
        await db.ref(`${collection}/${listingId}`).update({ imageThumbs: nextThumbs });
        console.log(`  updated ${collection}/${listingId} (${images.length} images)`);
      }

      migrated += 1;
    } catch (error) {
      failed += 1;
      console.error(`  failed ${collection}/${listingId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(`- ${collection}: scanned=${scanned} migrated=${migrated} skipped=${skipped} failed=${failed}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const { app, storageBucket } = createAdminApp();
  const db = getDatabase(app);
  const bucket = getStorage(app).bucket(storageBucket);

  console.log(`${options.dryRun ? 'DRY RUN' : 'WRITE MODE'} collections=${options.collections.join(',')} limit=${options.limit || 'none'}`);

  for (const collection of options.collections) {
    await migrateCollection({
      db,
      bucket,
      bucketName: storageBucket,
      collection,
      dryRun: options.dryRun,
      limit: options.limit,
    });
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});