import type { GameId } from '@manatees/shared/types';

import type { Game } from './game';

export class GameRepository {
  private readonly gameMap = new Map<GameId, Game>();

  async getAll(): Promise<Game[]> {
    return [...this.gameMap.values()];
  }

  async has(gameId: GameId): Promise<boolean> {
    const game = await this.get(gameId);
    return !!game;
  }

  async count(): Promise<number> {
    return this.gameMap.size;
  }

  async get(gameId: GameId): Promise<Game | undefined> {
    return this.gameMap.get(gameId);
  }

  async create(game: Game): Promise<void> {
    this.gameMap.set(game.id, game);
  }

  async delete(gameId: GameId): Promise<void> {
    this.gameMap.delete(gameId);
  }
}
