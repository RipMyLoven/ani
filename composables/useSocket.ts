import type { SocketInstance } from '~/types/socket';

export const useSocket = (): SocketInstance => {
  const { $socket } = useNuxtApp() as { $socket: SocketInstance };
  
  if (!$socket) {
    throw new Error('Socket not available. Make sure WebSocket plugin is loaded.');
  }
  
  return $socket;
};