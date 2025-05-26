import type { SocketInstance } from '~/types/socket';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  // Только на клиенте
  if (process.server) return;
  
  // Ждем полной загрузки Vue приложения
  await nextTick();
  
  const authStore = useAuthStore();
  
  try {
    // Проверяем, доступен ли WebSocket плагин
    const { $socket } = useNuxtApp() as { $socket: any };
    
    if (!$socket) {
      console.warn('[WEBSOCKET MIDDLEWARE] Socket plugin not available');
      return;
    }
    
    // Проверяем токен
    const token = useCookie('token').value;
    
    if (authStore.user && token && !$socket.getInstance()) {
      try {
        await $socket.connect();
        console.log('[WEBSOCKET MIDDLEWARE] WebSocket auto-connected for authenticated user');
      } catch (error) {
        console.error('[WEBSOCKET MIDDLEWARE] Failed to auto-connect WebSocket:', error);
      }
    }
    
    if ((!authStore.user || !token) && $socket.getInstance()) {
      $socket.disconnect();
      console.log('[WEBSOCKET MIDDLEWARE] WebSocket disconnected for unauthenticated user');
    }
  } catch (error) {
    console.error('[WEBSOCKET MIDDLEWARE] Error in WebSocket middleware:', error);
  }
});