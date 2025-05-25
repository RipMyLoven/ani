import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  created_at?: string;
  sessionToken?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(false);
  const checking = ref(false);

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
      const response = await $fetch<{ user: User }>('/api/auth/me', {
        headers: {
          'client-side': 'true'
        }
      });
      
      if (response && response.user) {
        user.value = response.user;
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  const isAuthenticated = computed(() => !!user.value);

  return {
    user,
    loading,
    checking,
    isAuthenticated,
    setUser,
    logout,
    checkAuth
  };
}, {
  persist: {
    storage: persistedState.localStorage,
    key: 'auth-store',
    paths: ['user'] // Persist only the user data
  }
});