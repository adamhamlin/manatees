import type {
  BlackCard,
  ClientGameEvent,
  GameplayState,
  GameSettings,
  PlayersAndScores,
  ServerGameEvent,
  User,
  WhiteCard,
} from '@manatees/shared/types';
import { get } from 'svelte/store';
import { match } from 'ts-pattern';

import type { ActiveGameState } from '$lib/game/active-game.types';
import { connectToGame } from '$lib/game/game.utils';
import type { PreGameState } from '$lib/game/pre-game.types';
import { currentUser } from '$lib/utils/current-user.utils';
import { dismissToast, showErrorToast, showWarningToast } from '$lib/utils/toast.utils';

type GameSessionState = {
  adminUser: User | undefined;
  playersAndScores: PlayersAndScores;
  gamePhase: GameplayState | undefined;
  judge: User | undefined;
  blackCard: BlackCard | undefined;
  hand: WhiteCard[];
  submittedPlayerIds: string[];
  playedCards: WhiteCard[][];
  roundResult: { winner: User; winningCards: WhiteCard[] } | undefined;
  gameWinner: User | undefined;
  disconnectedPlayerIds: string[];
  joinRequests: Array<{ user: User; isApproved: boolean }>;
  gameConfig: GameSettings | undefined;
  isGameStarted: boolean;
};

type GameSessionOptions = {
  onNavigateToLobby: () => void;
  onRequestRemovePlayer: (playerId: string) => void;
};

type GameSession = {
  readonly state: GameSessionState;
  readonly activeGameState: ActiveGameState;
  readonly preGameState: PreGameState;
  connect: (gameId: string) => void;
  disconnect: () => void;
  send: (event: ClientGameEvent) => boolean;
  setGameConfig: (gameConfig: GameSettings) => void;
};

export function createGameSession({ onNavigateToLobby, onRequestRemovePlayer }: GameSessionOptions): GameSession {
  const state = $state<GameSessionState>({
    adminUser: undefined,
    playersAndScores: {},
    gamePhase: undefined,
    judge: undefined,
    blackCard: undefined,
    hand: [],
    submittedPlayerIds: [],
    playedCards: [],
    roundResult: undefined,
    gameWinner: undefined,
    disconnectedPlayerIds: [],
    joinRequests: [],
    gameConfig: undefined,
    isGameStarted: false,
  });
  let socket: WebSocket | undefined;
  let activeGameId: string | undefined;

  const isAdmin = (): boolean => Boolean(state.adminUser && get(currentUser)?.id === state.adminUser.id);

  function clearDisconnectedPlayer(playerId: string): void {
    state.disconnectedPlayerIds = state.disconnectedPlayerIds.filter((id) => id !== playerId);
    dismissToast(`player-disconnected:${playerId}`);
  }

  function removeDisconnectedPlayer(playerId: string): void {
    if (activeGameId && isAdmin()) {
      onRequestRemovePlayer(playerId);
    }
  }

  function handleMessage(event: ServerGameEvent): void {
    match(event)
      .with({ type: 'gameSnapshot' }, ({ payload }) => {
        state.adminUser = payload.admin;
        state.playersAndScores = payload.playersAndScores;
        state.gameConfig = payload.gameConfig;
        state.gamePhase = payload.state;
        if ('judge' in payload) {
          state.judge = payload.judge;
          state.blackCard = payload.blackCard;
          state.submittedPlayerIds = payload.state === 'playing' ? payload.submittedPlayerIds : [];
        } else {
          state.judge = undefined;
          state.blackCard = undefined;
          state.submittedPlayerIds = [];
        }
        state.isGameStarted = payload.state !== 'created';
      })
      .with({ type: 'playerJoined' }, ({ payload }) => {
        state.joinRequests = state.joinRequests.filter((request) => request.user.id !== payload.player.id);
      })
      .with({ type: 'playerJoinRequestUpdated' }, ({ payload }) => {
        const request = { user: payload.player, isApproved: payload.isApproved };
        const existingIndex = state.joinRequests.findIndex(({ user }) => user.id === payload.player.id);
        if (existingIndex === -1) {
          state.joinRequests = [...state.joinRequests, request];
        } else {
          state.joinRequests[existingIndex] = request;
        }
      })
      .with({ type: 'playerJoinRequestCancelled' }, ({ payload }) => {
        state.joinRequests = state.joinRequests.filter(({ user }) => user.id !== payload.playerId);
        if (payload.playerId === get(currentUser)?.id) {
          showErrorToast('Your request to join the in-progress game was rejected.');
          onNavigateToLobby();
        }
      })
      .with({ type: 'playerReconnected' }, ({ payload }) => {
        clearDisconnectedPlayer(payload.player.id);
      })
      .with({ type: 'playerDisconnected' }, ({ payload }) => {
        const player = payload.player;
        if (!state.disconnectedPlayerIds.includes(player.id)) {
          state.disconnectedPlayerIds = [...state.disconnectedPlayerIds, player.id];
        }
        const playerName = player.displayName || player.name;
        const toastKey = `player-disconnected:${player.id}`;
        if (isAdmin()) {
          showWarningToast(
            `${playerName} is currently disconnected. They will be removed from the game if they do not reconnect within 60 seconds.`,
            toastKey,
            { label: 'Remove now', onClick: () => removeDisconnectedPlayer(player.id) }
          );
        } else {
          showWarningToast(`${playerName} is currently disconnected.`, toastKey);
        }
      })
      .with({ type: 'playerLeft' }, ({ payload }) => {
        clearDisconnectedPlayer(payload.player.id);
        if (payload.reason === 'removedByAdmin') {
          const playerName = payload.player.displayName || payload.player.name;
          if (payload.player.id === get(currentUser)?.id) {
            showWarningToast('The admin removed you from the game.', `removed-by-admin:${payload.player.id}`);
            onNavigateToLobby();
          } else if (!isAdmin()) {
            showWarningToast(
              `${playerName} was removed from the game by the admin.`,
              `player-removed:${payload.player.id}`
            );
          }
        }
      })
      .with({ type: 'playerAutoPlayed' }, ({ payload }) => {
        if (payload.player.id === get(currentUser)?.id) {
          showWarningToast('The admin played cards for you.', `admin-auto-play:${payload.player.id}`);
        }
      })
      .with({ type: 'adminSkippedRound' }, () => {
        if (!isAdmin()) {
          showWarningToast('The admin skipped to the next round.', 'admin-skipped-round');
        }
      })
      .with({ type: 'gameAdminUpdated' }, ({ payload }) => {
        state.adminUser = payload.newAdmin;
      })
      .with({ type: 'gameConfigUpdated' }, ({ payload }) => {
        state.gameConfig = payload.gameConfig;
      })
      .with({ type: 'gameStarted' }, ({ payload }) => {
        state.isGameStarted = true;
        state.gameWinner = undefined;
        state.playersAndScores = payload.playersAndScores;
      })
      .with({ type: 'gameDeleted' }, () => {
        if (!isAdmin()) {
          showErrorToast('The admin deleted the game.');
        }
        onNavigateToLobby();
      })
      .with({ type: 'gameCancelled' }, () => {
        state.isGameStarted = false;
        state.gamePhase = 'created';
        state.roundResult = undefined;
        state.gameWinner = undefined;
      })
      .with({ type: 'handUpdated' }, ({ payload }) => {
        state.hand = payload.hand;
      })
      .with({ type: 'roundStarted' }, ({ payload }) => {
        state.gamePhase = 'playing';
        state.judge = payload.judge;
        state.blackCard = payload.blackCard;
        state.playersAndScores = payload.playersAndScores;
        state.submittedPlayerIds = [];
        state.playedCards = [];
        state.roundResult = undefined;
      })
      .with({ type: 'otherPlayerPlayedCards' }, ({ payload }) => {
        if (!state.submittedPlayerIds.includes(payload.player.id)) {
          state.submittedPlayerIds = [...state.submittedPlayerIds, payload.player.id];
        }
      })
      .with({ type: 'allPlayersPlayedCards' }, ({ payload }) => {
        state.gamePhase = 'judging';
        state.playedCards = payload.allPlayedCards;
      })
      .with({ type: 'roundCompleted' }, ({ payload }) => {
        state.gamePhase = 'roundCompleted';
        state.roundResult = payload;
        const winner = state.playersAndScores[payload.winner.id];
        if (winner) {
          state.playersAndScores = {
            ...state.playersAndScores,
            [payload.winner.id]: { ...winner, score: winner.score + 1 },
          };
        }
      })
      .with({ type: 'gameCompleted' }, ({ payload }) => {
        state.gamePhase = 'gameCompleted';
        state.gameWinner = payload.winner;
        state.playersAndScores = payload.playersAndScores;
      })
      .with({ type: 'gameCreated' }, () => undefined)
      .exhaustive();
  }

  return {
    get state() {
      return state;
    },
    get activeGameState(): ActiveGameState {
      return {
        gamePhase: state.gamePhase,
        playersAndScores: state.playersAndScores,
        judge: state.judge,
        blackCard: state.blackCard,
        hand: state.hand,
        submittedPlayerIds: state.submittedPlayerIds,
        playedCards: state.playedCards,
        roundResult: state.roundResult,
        disconnectedPlayerIds: state.disconnectedPlayerIds,
      };
    },
    get preGameState(): PreGameState {
      return {
        adminUser: state.adminUser,
        playersAndScores: state.playersAndScores,
        gameConfig: state.gameConfig,
      };
    },
    connect(gameId: string): void {
      activeGameId = gameId;
      try {
        socket = connectToGame(gameId, handleMessage);
      } catch (error) {
        showErrorToast('Unable to connect to game room.', error);
      }
    },
    disconnect(): void {
      socket?.close();
      socket = undefined;
      activeGameId = undefined;
    },
    send(event: ClientGameEvent): boolean {
      if (socket?.readyState !== WebSocket.OPEN) {
        return false;
      }
      socket.send(JSON.stringify(event));
      return true;
    },
    setGameConfig(gameConfig: GameSettings): void {
      state.gameConfig = gameConfig;
    },
  };
}
