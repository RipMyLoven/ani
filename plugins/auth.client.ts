export default defineNuxtPlugin(async () => {
  // Инициализация auth store на клиенте
  const authStore = useAuthStore();
  
  // Проверяем токен при инициализации
  if (process.client && !authStore.user) {
    const token = useCookie('token').value;
    if (token && !authStore.loading) {
      try {
        await authStore.checkAuth();
      } catch (error) {
        console.log('Auth check failed during initialization');
      }
    }
  }
});