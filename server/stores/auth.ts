import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface User {
  id: string;
  username: string;
  email: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  
  function setUser(newUser: User | null) {
    user.value = newUser;
  }
  
  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      user.value = null;
    }
  }
  
  async function checkAuth() {
    try {
      loading.value = true;
      const { user: fetchedUser } = await $fetch<{ user: User }>('/api/auth/me');
      user.value = fetchedUser;
    } catch (error) {
      user.value = null;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    user,
    loading,
    setUser,
    logout,
    checkAuth
  };
}, {
  persist: true
});