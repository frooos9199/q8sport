const DB = 'https://q8sportcar-default-rtdb.europe-west1.firebasedatabase.app';

function requiredArg(value, label) {
  if (!value) {
    console.error(`Usage: node scripts/list-parts-by-user.mjs <userId>`);
    console.error(`Example: node scripts/list-parts-by-user.mjs lC7W0M7qSGbzqPAozrOE1nNPKF02`);
    process.exit(2);
  }
  return value;
}

function normalizeText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.ar || value.en || '';
}

async function main() {
  const userId = requiredArg(process.argv[2], 'userId');

  const res = await fetch(`${DB}/parts.json`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const parts = await res.json();
  const matches = [];

  for (const [id, item] of Object.entries(parts || {})) {
    if (item && item.userId === userId) {
      matches.push({
        id,
        title: normalizeText(item.title),
        price: item.price,
        titleType: typeof item.title,
        hasTitleAr: Boolean(item.title?.ar),
        hasTitleEn: Boolean(item.title?.en),
      });
    }
  }

  console.log(`Found ${matches.length} parts for userId=${userId}`);
  matches.slice(0, 50).forEach((m) => {
    console.log(`- ${m.id} | titleType=${m.titleType} | price=${m.price} | title="${m.title}"`);
  });
}

main().catch((e) => {
  console.error('ERROR:', e?.message || e);
  process.exit(1);
});
