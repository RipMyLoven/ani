<template>
  <div class="flex items-center bg-[#333333] p-3 rounded-lg my-2 w-full">
    <!-- User avatar -->
    <div class="h-12 w-12 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
      <img 
        v-if="friend.avatar" 
        :src="friend.avatar" 
        alt="Avatar"
        class="h-full w-full object-cover"
      />
      <div v-else class="h-full w-full flex items-center justify-center text-gray-400 text-xl font-bold">
        {{ (friend.username ? friend.username.charAt(0) : '?').toUpperCase() }}
      </div>
    </div>
    
    <!-- User info -->
    <div class="ml-3 flex-grow">
      <div class="flex justify-between">
        <h3 class="text-white font-medium">
          {{ displayName }}
        </h3>
        <span v-if="friend.status === 'online'" class="text-green-400 text-xs">Online</span>
        <span v-if="friend.status === 'offline'" class="text-gray-400 text-xs">Offline</span>
      </div>
    </div>
    
    <button 
      @click="openChat()"
      class="ml-2 bg-[#444444] text-white px-3 py-1 rounded text-xs hover:bg-[#555555]"
    >
      Chat
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  friend: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['openChat']);
const router = useRouter();

const displayName = computed(() => {
  return props.friend.username || 'Unknown User';
});

const openChat = () => {
  console.log('[FRIEND DEBUG] Opening chat with friend:', props.friend);
  console.log('[FRIEND DEBUG] Friend ID:', props.friend.id);
  console.log('[FRIEND DEBUG] Friend friend_id:', props.friend.friend_id);
  console.log('[FRIEND DEBUG] Friend username:', props.friend.username);
  console.log('[FRIEND DEBUG] Friend status:', props.friend.status);
  
  // Используем friend_id если доступен, иначе используем id
  let friendId = props.friend.friend_id || props.friend.id;
  
  // Убираем префикс user: если он есть
  friendId = friendId.replace(/^user:/, '');
  
  console.log('[FRIEND DEBUG] Final friendId to emit:', friendId);
  emit('openChat', friendId);
  router.push(`/chat?participantId=${friendId}`);
}
</script>