import { appConfiguration } from '@manatees/shared/types';

export const configuration = {
  server: {
    protocol: 'http',
    hostname: 'localhost',
    port: 3456,
    webSocket: {
      maxPayloadSizeBytes: 10 * 1024,
    },
  },
  game: appConfiguration.game,
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
