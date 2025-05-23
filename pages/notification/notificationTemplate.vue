<template>
  <div class="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-4">
    <!-- Loader -->
    <div v-if="isLoading" class="flex justify-center py-8 w-full">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <!-- Error message -->
    <div v-else-if="error" class="w-full bg-red-600 text-white p-4 rounded mb-4">
      {{ error }}
    </div>
    
    <!-- Friend request notifications -->
    <div v-else-if="pendingRequests.length > 0" class="w-full">
      <div class="mb-4 text-white text-lg font-medium">
        Входящие запросы в друзья
      </div>
      <FriendRequestNotification
        v-for="request in pendingRequests"
        :key="request.id"
        :request="request"
        @accept="handleAccept"
        @decline="handleDecline"
      />
    </div>
    
    <!-- Empty state -->
    <EmptyNotifications v-else />
    
    <!-- Action status message -->
    <div 
      v-if="actionStatus" 
      class="fixed bottom-6 right-6 p-4 rounded shadow-lg z-50"
      :class="actionStatus.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
    >
      {{ actionStatus.message }}
    </div>
    
    <!-- Debug info (can be removed in production) -->
    <div v-if="pendingRequests.length === 0 && !isLoading && !error" class="mt-8 p-4 bg-gray-800 rounded-lg text-xs text-gray-300">
      <p class="mb-2">Debug Information:</p>
      <button @click="loadPendingRequests" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 mb-2">
        Refresh Notifications
      </button>
      <pre class="whitespace-pre-wrap text-left">{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNotificationLogic } from './notificationLogic';
import FriendRequestNotification from './components/FriendRequestNotification.vue';
import EmptyNotifications from './components/EmptyNotifications.vue';
import { useAuthStore } from '~/server/stores/auth';

const authStore = useAuthStore();

const {
  pendingRequests,
  isLoading,
  error,
  loadPendingRequests,
  acceptFriendRequest,
  declineFriendRequest
} = useNotificationLogic();

const actionStatus = ref<{type: 'success' | 'error', message: string} | null>(null);

// Debug information
const debugInfo = computed(() => {
  return {
    currentUser: authStore.user?.username,
    pendingRequestsCount: pendingRequests.value.length,
    pendingRequests: pendingRequests.value
  };
});

// Функция для принятия заявки в друзья
async function handleAccept(friendshipId: string) {
  const result = await acceptFriendRequest(friendshipId);
  
  if (result.success) {
    actionStatus.value = {
      type: 'success',
      message: 'Запрос в друзья принят'
    };
  } else {
    actionStatus.value = {
      type: 'error',
      message: result.message || 'Ошибка при принятии запроса'
    };
  }
  
  // Скрываем сообщение через 3 секунды
  setTimeout(() => {
    actionStatus.value = null;
  }, 3000);
}

// Функция для отклонения заявки в друзья
async function handleDecline(friendshipId: string) {
  const result = await declineFriendRequest(friendshipId);
  
  if (result.success) {
    actionStatus.value = {
      type: 'success',
      message: 'Запрос в друзья отклонен'
    };
  } else {
    actionStatus.value = {
      type: 'error',
      message: result.message || 'Ошибка при отклонении запроса'
    };
  }
  
  // Скрываем сообщение через 3 секунды
  setTimeout(() => {
    actionStatus.value = null;
  }, 3000);
}
</script>