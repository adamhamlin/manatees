import { faker } from '@faker-js/faker';
import { appConfiguration, type GameSettings } from '@manatees/shared/types';
import pluralize from 'pluralize';
import { capitalize } from 'radashi';

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
    return { ...this.settings };
  }

  upsert(updates: Partial<GameSettings>): GameSettings {
    this.settings = { ...this.settings, ...updates };
    return this.toJSON();
  }

  private getInitialGameConfig(): GameSettings {
    const gameName = [
      faker.word.adjective(),
      ...pluralize(faker.animal.type()).split(' '), // animal might be like "polar bear"
    ]
      .map((el) => capitalize(el))
      .join(' ');

    return {
      gameName,
      deckIds: [],
      handSize: appConfiguration.game.hand.size.default,
      winningScore: appConfiguration.game.winningScore.default,
    };
  }
}
