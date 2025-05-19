import { useAuthStore } from '~/server/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login' || to.path === '/register') {
    return;
  }
  
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore();
    
    if (!authStore.user) {
      await authStore.checkAuth();
    }
    
    if (!authStore.user) {
      return navigateTo('/login');
    }
  }
});