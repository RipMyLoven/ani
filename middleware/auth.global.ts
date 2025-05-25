import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  // Пропускаем выполнение на сервере
  if (process.server) return;
  
  // Ждем полной инициализации Vue приложения
  await nextTick();
  
  const authStore = useAuthStore();
  
  // Проверяем аутентификацию только если пользователь не загружен и не проверяется
  if (!authStore.user && !authStore.loading && !authStore.checking) {
    authStore.checking = true;
    try {
      await authStore.checkAuth();
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      authStore.checking = false;
    }
  }
  
  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = publicPages.includes(to.path);
  
  // Перенаправления только если пользователь определен
  if (isPublicPage && authStore.user) {
    console.log('Redirecting authenticated user from public page to home');
    return navigateTo('/home');
  }
  
  const authRequired = to.path.startsWith('/home') || to.path.startsWith('/chat') || to.path.startsWith('/notification');
  
  if (authRequired && !authStore.user && !authStore.loading) {
    console.log('Redirecting unauthenticated user to login');
    return navigateTo('/login');
  }
});