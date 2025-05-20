import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface User {
  id: string;
  username: string;
  email: string;
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
      user.value = null;
    } finally {
      user.value = null;
    }
  }
  
  return {
    user,
    loading,
    checking,
    setUser,
    logout,
    checkAuth
  };
}, {
  persist: true
});