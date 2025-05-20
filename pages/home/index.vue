<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto bg-[#222222] rounded-lg shadow-lg p-6 text-white">
      <h1 class="text-2xl font-bold mb-6 text-center">Home Page</h1>
      
      <div v-if="authStore.user" class="mb-6">
        <div class="mb-4 flex items-center justify-center">
          <div class="w-20 h-20 bg-[#333333] rounded-full flex items-center justify-center mr-4">
            <div>
              <!-- Placeholder for user avatar -->
            </div>
          </div>
          <div>
            <h2 class="text-xl font-medium">{{ authStore.user.username }}</h2>
            <p class="text-gray-400">{{ authStore.user.email }}</p>
          </div>
        </div>
        
        <div class="bg-[#333333] p-4 rounded-md mb-6">
          <h3 class="text-lg font-medium mb-2">Account Info</h3>
          <p class="text-gray-300 mb-1">
            <span class="text-gray-400">Username:</span> {{ authStore.user.username }}
          </p>
          <p class="text-gray-300 mb-1">
            <span class="text-gray-400">Email:</span> {{ authStore.user.email }}
          </p>
          <p class="text-gray-300">
            <span class="text-gray-400">User ID:</span> {{ authStore.user.id }}
          </p>
        </div>
        
        <button 
          @click="logout" 
          class="w-full bg-red-900 hover:bg-red-800 text-white py-3 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
      
      <div v-else class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <p class="text-gray-400">Loading user data...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/server/stores/auth';
import { useRouter } from '#app';
import { onMounted } from 'vue';

definePageMeta({
  title: 'Index Page',
  layout: 'clean',
  middleware: ['fade-transition'],
  order: 1,
});
const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  if (!authStore.user) {
    await authStore.checkAuth();
  }
});

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>