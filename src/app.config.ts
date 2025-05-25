export const configuration = {
  server: {
    protocol: 'http',
    hostname: 'localhost',
    port: 3456,
    webSocket: {
      maxPayloadSizeBytes: 10 * 1024,
    }
  },
  gameService: {
    maxGames: 10,
  },
  game: {
    players: {
      minHumanPlayers: 3,
      maxPlayers: 12,
    },
    deck: {
      minWhiteCardsPerPlayer: 50,
      minBlackCardsPerPlayer: 15,
    }
  },
} as const;

export function getServerBaseUrl(): URL {
  const conf = configuration.server;
  return new URL(`${conf.protocol}://${conf.hostname}:${conf.port}`);
}

export function getWebSocketServerBaseUrl(): URL {
  const url = getServerBaseUrl();
  url.protocol = url.protocol === 'https' ? 'wss' : 'ws';
  return url;
}