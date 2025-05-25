import { WhiteCard } from '@prisma/client';
import axios, { AxiosInstance } from 'axios';

import { GameplayClient } from './gameplay-client';
import { getServerBaseUrl } from '../app.config';
import { GameId, GameSettings, GameSummary, UserId } from '../game/game.types';
import { assertExists } from '../utils/utils';
import { ServerGameEvent } from '../game/events/event.server.types';

export class ManateesClient {
  private readonly restClient: AxiosInstance;
  private _gameplayClient: GameplayClient | undefined;

  constructor(private userId: UserId) {
    this.restClient = axios.create({ baseURL: getServerBaseUrl().toString(), headers: {
      'x-user-id': userId,
    } });
  }

  private get gameplayClient(): GameplayClient {
    const client = this._gameplayClient;
    assertExists(client);
    return client;
  }

  // REST API OPERATIONS

  async getGames(): Promise<{games: GameSummary[]}> {
    return (await this.restClient.get('/game')).data;
  }

  async startGame(): Promise<void> {
    await this.restClient.put(`/game/${this.gameplayClient.gameId}/start`, {});
  }

  async leaveGame(): Promise<void> {
    await this.restClient.put(`/game/${this.gameplayClient.gameId}/leave`, {});
    this._gameplayClient = undefined;
  }

  async cancelGame(): Promise<void> {
    await this.restClient.put(`/game/${this.gameplayClient.gameId}/cancel`, {});
  }

  async deleteGame(): Promise<void> {
    await this.restClient.delete(`/game/${this.gameplayClient.gameId}`);
  }

  async skipRound(): Promise<void> {
    await this.restClient.put(`/game/${this.gameplayClient.gameId}/skipRound`, {});
  }

  async updateGameConfig(updates: Partial<GameSettings>): Promise<void> {
    await this.restClient.put(`/game/${this.gameplayClient.gameId}/config`, updates);
  }

  async removePlayer(userId: UserId): Promise<void> {
    await this.restClient.delete(`/game/${this.gameplayClient.gameId}/player/${userId}`);
  }

  async addNonHumanPlayer(userId: UserId): Promise<void> {
    await this.restClient.put(`/game/${this.gameplayClient.gameId}/player/${userId}`, {});
  }

  // GAMEPLAY/WEBSOCKET OPERATIONS

  createOrJoinGame(gameId: GameId): void {
    if (this._gameplayClient) {
      throw new Error('Must leave current game before creating/joining another');
    }
    this._gameplayClient = new GameplayClient(this.userId, gameId);
  }

  onGameplayEvent(cb: (event: ServerGameEvent) => void): void {
    this.gameplayClient.onEvent(cb);
  }

  playCards(cards: WhiteCard[]): void {
    this.gameplayClient.playCards(cards);
  }

  selectWinningCards(cards: WhiteCard[]): void {
    this.gameplayClient.selectWinningCards(cards);
  }
}
