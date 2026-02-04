/**
 * Seed Bad Words Database
 * Run: node scripts/seed-bad-words.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Arabic bad words
const ARABIC_BAD_WORDS = [
  { word: 'كلب', severity: 'HIGH' },
  { word: 'حمار', severity: 'MEDIUM' },
  { word: 'غبي', severity: 'LOW' },
  { word: 'احمق', severity: 'MEDIUM' },
  { word: 'قذر', severity: 'HIGH' },
  { word: 'وسخ', severity: 'MEDIUM' },
  { word: 'لعنة', severity: 'MEDIUM' },
  { word: 'خنزير', severity: 'SEVERE' },
  // Add more as needed
];

// English bad words
const ENGLISH_BAD_WORDS = [
  { word: 'fuck', severity: 'SEVERE' },
  { word: 'shit', severity: 'HIGH' },
  { word: 'damn', severity: 'MEDIUM' },
  { word: 'bitch', severity: 'HIGH' },
  { word: 'ass', severity: 'MEDIUM' },
  { word: 'bastard', severity: 'HIGH' },
  { word: 'idiot', severity: 'LOW' },
  { word: 'stupid', severity: 'LOW' },
  { word: 'asshole', severity: 'HIGH' },
  { word: 'crap', severity: 'MEDIUM' },
  // Add more as needed
];

async function main() {
  console.log('🌱 Seeding bad words database...');

  // Seed Arabic bad words
  for (const { word, severity } of ARABIC_BAD_WORDS) {
    await prisma.badWord.upsert({
      where: { word },
      update: { severity, active: true },
      create: {
        word,
        severity,
        language: 'ar',
        active: true,
      },
    });
  }
  console.log(`✅ Seeded ${ARABIC_BAD_WORDS.length} Arabic bad words`);

  // Seed English bad words
  for (const { word, severity } of ENGLISH_BAD_WORDS) {
    await prisma.badWord.upsert({
      where: { word },
      update: { severity, active: true },
      create: {
        word,
        severity,
        language: 'en',
        active: true,
      },
    });
  }
  console.log(`✅ Seeded ${ENGLISH_BAD_WORDS.length} English bad words`);

  console.log('✨ Bad words database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding bad words:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
