import { PrismaClient } from '@prisma/client';

import { seed } from './seed';

const seedClient = new PrismaClient();

seed(seedClient)
  .then(async () => {
    await seedClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await seedClient.$disconnect();
    process.exit(1);
  });
