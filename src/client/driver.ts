import { WhiteCard } from '@prisma/client';
import { match } from 'ts-pattern';

import { ManateesClient } from './client';

const gameId = 'fartyfarts';

async function run(): Promise<void> {
  // Create the clients
  const [player1, _player2, _player3] = await Promise.all([
    createTestClient('player1'),
    createTestClient('player2'),
    createTestClient('player3'),
  ]);
  await sleep(2000);
  await player1.startGame();
}

// Function to create and manage a Manatees test player
async function createTestClient(userId: string): Promise<ManateesClient> {
  const player = new ManateesClient(userId);
  player.createOrJoinGame(gameId);

  let hand: WhiteCard[] = [];
  let amJudge = false;

  player.onGameplayEvent(async (event) => {
    await match(event)
      .with({ type: 'roundStarted' }, async (matched) => {
        amJudge = matched.payload.judge === userId;
        // Just pick first card(s)
        await sleep(400);
        player.playCards(hand.slice(0, matched.payload.blackCard.pickCount));
      })
      .with({ type: 'handUpdated' }, async (matched) => {
        hand = matched.payload.hand;
      })
      .with({ type: 'allPlayersPlayedCards' }, async (matched) => {
        if (amJudge) {
          // Just pick first option
          await sleep(2000);
          player.selectWinningCards(matched.payload.allPlayedCards[0]);
        }
      })
      .otherwise(async () => {
        // no-op
      });
  });
  return player;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run it!
void run();
