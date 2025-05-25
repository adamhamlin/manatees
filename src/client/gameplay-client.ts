import { WhiteCard } from '@prisma/client';
import WebSocket from 'ws';

import { getWebSocketServerBaseUrl } from '../app.config';
import { ServerGameEvent } from '../game/events/event.server.types';
import { GameId, UserId } from '../game/game.types';
import { Messenger } from '../utils/messenger';

export class GameplayClient {
  private readonly ws: WebSocket;
  private readonly messenger: Messenger;

  constructor(private userId: UserId, public gameId: GameId) {
    const url = getWebSocketServerBaseUrl();
    url.pathname = `game/${gameId}`;
    this.ws = new WebSocket(url, { headers: { 'x-user-id': userId } });
    this.messenger = new Messenger(this.ws);

    this.ws.on('open', () => {
      this.log(`Connected to server`);
    });

    this.ws.on('message', (data) => {
      this.log(`Received -> ${data}`);
    });

    this.ws.on('error', (err) => {
      this.log(`Error ->`, err);
    });

    this.ws.on('close', () => {
      this.log(`Connection closed`);
    });
  }

  onEvent(cb: (event: ServerGameEvent) => void): void {
    this.messenger.onMessageReceived(cb);
  }

  playCards(cards: WhiteCard[]): void {
    this.messenger.sendMessage({
      type: 'cardsPlayed',
      payload: {
        cards: cards.map((card) => card.id),
      },
    });
  }

  selectWinningCards(cards: WhiteCard[]): void {
    this.messenger.sendMessage({
      type: 'winningCardsSelected',
      payload: {
        winningCards: cards.map((card) => card.id),
      },
    });
  }

  private log(msg: string, err?: unknown): void {
    const fullMsg = `[GameplayClient:${this.gameId}] ${this.userId} >> ${msg}`;
    if (err) {
      console.error(fullMsg, err);
    } else {
      console.log(fullMsg);
    }
  }
}
