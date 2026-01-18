import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    // In case old deployments stored request images, clear them.
    // If the column doesn't exist in the DB, this will throw and we handle it.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (prisma as any).$executeRawUnsafe(
      'UPDATE "requests" SET "image" = NULL WHERE "image" IS NOT NULL'
    );

    // $executeRawUnsafe returns number of rows for postgres
    console.log(`Cleared request images. Rows updated: ${result}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Failed to clear request images:', err);
  process.exit(1);
});
