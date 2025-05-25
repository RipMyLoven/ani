import type { SocketInstance } from '~/types/socket';
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  // Выполняем только на клиенте
  if (process.server) return;
  
  // Ждем пока Vue приложение полностью загрузится
  await nextTick();
  
  const authStore = useAuthStore();
  const { $socket } = useNuxtApp() as { $socket: SocketInstance };
  
  // Проверяем наличие токена в cookie
  const token = useCookie('token').value;
  
  if (authStore.user && token && !$socket.getInstance()) {
    try {
      await $socket.connect();
      console.log('WebSocket auto-connected for authenticated user');
    } catch (error) {
      console.error('Failed to auto-connect WebSocket:', error);
      console.warn('Failed to establish real-time connection');
    }
  }
  
  if ((!authStore.user || !token) && $socket.getInstance()) {
    $socket.disconnect();
    console.log('WebSocket disconnected for unauthenticated user');
  }
});