<template>
  <div class="flex items-start mb-4" :class="{ 'flex-row-reverse': isOwnMessage }">
    <!-- Avatar -->
    <div class="flex-shrink-0" :class="isOwnMessage ? 'ml-3' : 'mr-3'">
      <div class="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
        <span class="text-white text-sm font-medium">
          {{ getInitials(message.sender_username || 'Unknown') }}
        </span>
      </div>
    </div>
    
    <!-- Message content -->
    <div class="flex-1 max-w-xs lg:max-w-md">
      <div 
        class="rounded-lg px-4 py-2"
        :class="isOwnMessage 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : 'bg-gray-700 text-white rounded-tl-none'"
      >
        <p class="text-sm">{{ message.content }}</p>
      </div>
      
      <!-- Timestamp -->
      <div class="flex items-center mt-1" :class="isOwnMessage ? 'justify-end' : 'justify-start'">
        <span class="text-gray-400 text-xs">
          {{ formatTime(message.created_at) }}
        </span>
        <span v-if="message.is_edited" class="text-gray-400 text-xs ml-2">
          (edited)
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import type { Message } from '~/types/chat';

interface Props {
  message: Message;
  currentUserId?: string | null; // Change from string | undefined to string | null
}

const props = defineProps<Props>();
const authStore = useAuthStore();

const isOwnMessage = computed(() => {
  // Use the prop first, then fallback to store
  const userId = props.currentUserId || authStore.user?.id;
  if (!userId) return false;
  
  // Normalize both IDs for comparison
  const normalizedUserId = userId.replace(/^user:/, '');
  const normalizedSenderId = props.message.sender_id.replace(/^user:/, '');
  
  console.log('[LeftMessageChat] Comparing IDs:', { 
    normalizedUserId, 
    normalizedSenderId, 
    isOwn: normalizedUserId === normalizedSenderId 
  });
  
  return normalizedUserId === normalizedSenderId;
});

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};
</script>