import { io, Socket } from 'socket.io-client';

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore();
  
  let socket: Socket | null = null;
  let isConnecting = false;
  
  const connectSocket = () => {
    if (socket?.connected || isConnecting) {
      console.log('[SOCKET GLOBAL] Already connected or connecting');
      return socket;
    }
    
    const token = authStore.token;
    if (!token) {
      console.log('[SOCKET GLOBAL] No token available');
      return null;
    }
    
    isConnecting = true;
    console.log('[SOCKET GLOBAL] Connecting to WebSocket...');
    
    socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socket.on('connect', () => {
      console.log('[SOCKET GLOBAL] ✅ Connected to WebSocket server');
      isConnecting = false;
    });
    
    socket.on('connection_established', (data) => {
      console.log('[SOCKET GLOBAL] Connection established:', data);
    });
    
    socket.on('connection_error', (error) => {
      console.error('[SOCKET GLOBAL] Connection error:', error);
      isConnecting = false;
    });
    
    socket.on('disconnect', (reason) => {
      console.log('[SOCKET GLOBAL] Disconnected:', reason);
      isConnecting = false;
    });
    
    socket.on('connect_error', (error) => {
      console.error('[SOCKET GLOBAL] Connect error:', error);
      isConnecting = false;
    });
    
    return socket;
  };
  
  const disconnectSocket = () => {
    if (socket) {
      console.log('[SOCKET GLOBAL] Disconnecting...');
      socket.disconnect();
      socket = null;
      isConnecting = false;
    }
  };
  
  // Автоматическое подключение при аутентификации
  watch(() => authStore.user, (user) => {
    if (user && authStore.token) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, { immediate: true });
  
  // Переподключение при изменении токена
  watch(() => authStore.token, (token) => {
    if (token && authStore.user) {
      if (socket?.connected) {
        disconnectSocket();
      }
      connectSocket();
    } else {
      disconnectSocket();
    }
  });
  
  return {
    provide: {
      socket: {
        getInstance: () => socket,
        connect: connectSocket,
        disconnect: disconnectSocket,
        emit: (event: string, data: any) => {
          if (socket?.connected) {
            socket.emit(event, data);
          } else {
            console.warn('[SOCKET GLOBAL] Socket not connected, cannot emit:', event);
          }
        },
        on: (event: string, callback: (...args: any[]) => void) => {
          if (socket) {
            socket.on(event, callback);
          }
        },
        off: (event: string, callback?: (...args: any[]) => void) => {
          if (socket) {
            if (callback) {
              socket.off(event, callback);
            } else {
              socket.off(event);
            }
          }
        }
      }
    }
  };
});