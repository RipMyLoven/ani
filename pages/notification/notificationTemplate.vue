<template>
  <div class="flex flex-col items-center w-full max-w-3xl mx-auto px-4 py-4">
    <div v-if="isLoading" class="flex justify-center py-8 w-full">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else-if="error" class="w-full bg-red-600 text-white p-4 rounded mb-4">
      {{ error }}
    </div>
    
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
    
    <EmptyNotifications v-else />
    
    <div 
      v-if="actionStatus" 
      class="fixed bottom-6 right-6 p-4 rounded shadow-lg z-50"
      :class="actionStatus.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
    >
      {{ actionStatus.message }}
    </div>
    
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
import { useNotificationLogic } from './notificationLogic';
import FriendRequestNotification from './components/FriendRequestNotification.vue';
import EmptyNotifications from './components/EmptyNotifications.vue';

const {
  pendingRequests,
  isLoading,
  error,
  actionStatus,
  debugInfo,
  loadPendingRequests,
  handleAccept,
  handleDecline
} = useNotificationLogic();
</script>