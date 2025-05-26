import { io, Socket } from 'socket.io-client';
import type { SocketInstance, SocketEvents } from '~/types/socket';

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  
  let socket: Socket | null = null;
  
  const connectSocket = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!authStore.user) {
        reject(new Error('User not authenticated'));
        return;
      }

      const token = useCookie('token').value;
      if (!token) {
        reject(new Error('Authentication token not found'));
        return;
      }

      socket = io(window.location.origin, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socket.on('connect', () => {
        console.log('[DEBUG] WebSocket connected successfully');
        resolve();
      });

      socket.on('connection_established', (data) => {
        console.log('WebSocket handshake completed:', data);
      });

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
        reject(error);
      });

      socket.on('connection_error', (error) => {
        console.error('WebSocket setup error:', error.message);
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error.message);
      });
    });
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  };

  const socketInstance: SocketInstance = {
    connect: connectSocket,
    disconnect: disconnectSocket,
    getInstance: () => socket,
    emit: (event: string, data: any) => socket?.emit(event, data),
    on: (event: string, callback: (...args: any[]) => void) => socket?.on(event, callback),
    off: (event: string, callback?: (...args: any[]) => void) => socket?.off(event, callback)
  };

  return {
    provide: {
      socket: socketInstance
    }
  };
});