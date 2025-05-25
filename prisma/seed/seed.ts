import fs from 'fs';
import path from 'path';

import { PrismaClient } from '@prisma/client';
import { chain } from 'stream-chain';
import { withParser } from 'stream-json/streamers/StreamArray';

type DeckJson = {
  name: string;
  white: Array<{ text: string }>;
  black: Array<{ text: string; pick: number }>;
  official: boolean;
  watermark?: string;
};

// NOTE: File downloaded from https://crhallberg.com/cah/
const SOURCE_FILE = path.resolve(__dirname, 'cah-cards.json');

export async function seed(prisma: PrismaClient): Promise<void> {
  const streamChain = chain([
    fs.createReadStream(SOURCE_FILE, { encoding: 'utf8' }),
    withParser(),
    (parsed: { value: DeckJson }) => parsed.value,
  ]);

  for await (const deck of streamChain) {
    await seedDeck(prisma, deck);
  }
}

async function seedDeck(prisma: PrismaClient, deck: DeckJson): Promise<void> {
  const res = await prisma.deck.create({
    data: {
      name: deck.name,
      watermark: deck.watermark ?? '',
      whiteCards: {
        createMany: {
          skipDuplicates: true,
          data: deck.white.map((el) => ({ content: el.text })),
        },
      },
      blackCards: {
        createMany: {
          skipDuplicates: true,
          data: deck.black.map((el) => ({ content: el.text, pickCount: el.pick })),
        },
      },
    },
  });
  console.log(`Successfully seeded deck ${res.id}: '${deck.name}'`);
}
