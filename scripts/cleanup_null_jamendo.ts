import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Use raw Mongo command to delete docs where jamendoId is null OR missing
  const result: any = await (prisma as any).$runCommandRaw({
    delete: 'Song',
    deletes: [
      { q: { $or: [ { jamendoId: null }, { jamendoId: { $exists: false } }, { jamendoId: '' } ] }, limit: 0 },
    ],
  });
  const n = result?.n ?? result?.ok ?? 0;
  console.log(`Deleted documents with null/missing jamendoId: ${n}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
