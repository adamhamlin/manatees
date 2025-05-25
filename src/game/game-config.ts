import { GameSettings } from './game.types';

export class GameConfig {
  private settings: GameSettings;

  constructor() {
    this.settings = this.getInitialGameConfig();
  }

  get deckIds(): GameSettings['deckIds'] {
    return this.settings.deckIds;
  }

  get winningScore(): GameSettings['winningScore'] {
    return this.settings.winningScore;
  }

  get handSize(): GameSettings['handSize'] {
    return this.settings.handSize;
  }

  toJSON(): GameSettings {
    return {...this.settings};
  }

  upsert(updates: Partial<GameSettings>): GameSettings {
    this.settings = {...this.settings, ...updates};
    return this.toJSON();
  }

  private getInitialGameConfig(): GameSettings {
    // These are the default but may be modified during the game
    return {
      deckIds: [1,2], // TODO remove this, just for easier testing
      handSize: 10,
      winningScore: 7,
    };
  }
}