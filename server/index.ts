import { createServer } from 'http'
import { initializeWebSocket } from './websocket/socketHandler';

// Инициализация WebSocket сервера
export default async function initServer() {
  // Эта функция будет вызвана Nitro при запуске сервера
  const nitro = (globalThis as any).__nitro__;
  
  if (nitro && nitro.httpServer) {
    console.log('Initializing WebSocket server...');
    const io = initializeWebSocket(nitro.httpServer);
    
    // Сохраняем экземпляр io глобально для доступа из других частей приложения
    (globalThis as any).__socket_io__ = io;
    
    console.log('WebSocket server initialized successfully');
  } else {
    console.warn('HTTP server not available, WebSocket initialization skipped');
  }
}

