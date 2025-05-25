import type { SocketInstance } from '~/types/socket';

export const useSocket = () => {
  const { $socket } = useNuxtApp() as { $socket: SocketInstance };
  
  return {
    connect: () => $socket.connect(),
    disconnect: () => $socket.disconnect(),
    getInstance: () => $socket.getInstance(),
    emit: (event: string, data: any) => $socket.emit(event, data),
    on: (event: string, callback: (...args: any[]) => void) => $socket.on(event, callback),
    off: (event: string, callback?: (...args: any[]) => void) => $socket.off(event, callback)
  };
};