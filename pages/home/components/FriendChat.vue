<template>
  <div 
    @click="openChat()"
    class="flex items-center bg-[#333333] p-3 rounded-lg my-2 w-full cursor-pointer hover:bg-[#3a3a3a] transition-colors"
  >
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
      <div class="flex justify-between items-start">
        <div class="flex-grow">
          <!-- Username -->
          <h3 class="text-white font-medium">
            {{ displayName }}
          </h3>
          
          <!-- Last message -->
          <div v-if="friend.lastMessage" class="text-gray-400 text-sm mt-1 truncate">
            <span v-if="friend.lastMessage.isFromCurrentUser" class="text-gray-500">You: </span>
            <span v-else class="text-gray-500">{{ friend.lastMessage.sender_username }}: </span>
            <span>{{ friend.lastMessage.content }}</span>
          </div>
          <div v-else class="text-gray-500 text-sm mt-1 italic">
            No messages yet
          </div>
        </div>
        
        <!-- Time and status -->
        <div class="flex flex-col items-end ml-2">
          <span v-if="friend.lastMessage" class="text-gray-500 text-xs">
            {{ formatTime(friend.lastMessage.created_at) }}
          </span>
          <span v-if="friend.status === 'online'" class="text-green-400 text-xs mt-1">●</span>
          <span v-else-if="friend.status === 'offline'" class="text-gray-400 text-xs mt-1">●</span>
        </div>
      </div>
    </div>
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

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

const openChat = () => {
  console.log('[FRIEND DEBUG] Opening chat with friend:', props.friend);
  
  // Используем friend_id если доступен, иначе используем id
  let friendId = props.friend.friend_id || props.friend.id;
  
  // Убираем префикс user: если он есть
  friendId = friendId.replace(/^user:/, '');
  
  console.log('[FRIEND DEBUG] Final friendId to emit:', friendId);
  emit('openChat', friendId);
  router.push(`/chat?participantId=${friendId}`);
}
</script>