import { serverGameEventSchema, type ServerGameEvent } from '@manatees/shared/types';

import { environment } from '../environment';

export function connectToGame(
  gameId: string,
  onMessage: (message: ServerGameEvent) => void,
  onOpen?: () => void,
  onClose?: () => void
): WebSocket {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const socket = new WebSocket(
    `${wsProtocol}://${window.location.host}${environment.apiUrl}/game/${encodeURIComponent(gameId)}`
  );

  socket.addEventListener('open', () => {
    onOpen?.();
  });

  socket.addEventListener('message', (event) => {
    const message = serverGameEventSchema.parse(JSON.parse(event.data));
    onMessage(message);
  });

  socket.addEventListener('close', () => {
    onClose?.();
  });

  return socket;
}
