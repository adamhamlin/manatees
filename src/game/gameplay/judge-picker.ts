import { DeepSet } from 'deep-equality-data-structures';
import { shuffle } from 'radashi';

import { GamePlayers } from './game-players';
import { Player } from '../player/player';


export class JudgePicker {
  private currentJudgeIdx: number;
  private ordering: Player[];

  constructor(private gamePlayers: GamePlayers) {
    this.currentJudgeIdx = -1;
    this.ordering = [];
  }

  getCurrentJudge(): Player {
    return this.ordering[this.currentJudgeIdx];
  }

  setNextJudge(): void {
    if (this.currentJudgeIdx === -1) {
      this.init();
    }

    const currentJudge = this.getCurrentJudge();
    this.refresh();
    if (this.currentJudgeIdx < this.ordering.length - 1) {
      this.currentJudgeIdx += 1;
    } else {
      this.currentJudgeIdx = 0;
    }
    const newJudge = this.getCurrentJudge();

    // Non-human players obvi can't judge, but also don't allow the same judge twice in a row,
    // which may occur if player(s) left
    if (!newJudge.isHuman() || newJudge.user.id === currentJudge.user.id || !newJudge.isHuman()) {
      this.setNextJudge();
    }
  }

  private init(): void {
    this.ordering = shuffle(this.gamePlayers.getPlayerList());
    this.currentJudgeIdx = 0;
  }

  private refresh(): void {
    // object-hash lib has issues operating on websocket object, so just use userId for uniqueness
    const deepSetOpts = { transformer: (player: Player) => player.user.id } as const;

    const orderingSet = new DeepSet(this.ordering, deepSetOpts);
    const playerSet = new DeepSet(this.gamePlayers.getPlayerList(), deepSetOpts);
    const playersToAdd = playerSet.difference(orderingSet);
    const playersToRemove = orderingSet.difference(playerSet);
    if (playersToAdd.size) {
      this.ordering.push(...playersToAdd);
    }
    if (playersToRemove.size) {
      this.ordering = this.ordering.filter((player) => !playersToRemove.has(player));
    }
  }
}