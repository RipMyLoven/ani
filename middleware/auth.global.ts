import { useAuthStore } from '~/server/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return;
  
  const authStore = useAuthStore();
  
  if (!authStore.user && !authStore.loading) {
    await authStore.checkAuth();
  }
  
  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = publicPages.includes(to.path);
  
  if (isPublicPage && authStore.user) {
    console.log('Redirecting authenticated user from public page to home');
    return navigateTo('/home');
  }
  
  const authRequired = to.path.startsWith('/home');
  
  if (authRequired && !authStore.user) {
    console.log('Redirecting unauthenticated user to login');
    return navigateTo('/login');
  }
});