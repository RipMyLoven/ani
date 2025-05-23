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
          <small v-if="!friend.username" class="text-gray-400">(ID: {{ shortFriendId }})</small>
        </h3>
        <span v-if="friend.status === 'pending'" class="text-yellow-400 text-xs">Pending</span>
        <span v-if="friend.status === 'online'" class="text-green-400 text-xs">Online</span>
        <span v-if="friend.status === 'offline'" class="text-gray-400 text-xs">Offline</span>
      </div>
      <p v-if="friend.lastMessage" class="text-gray-400 text-sm truncate">{{ friend.lastMessage }}</p>
    </div>
    
    <!-- Action buttons based on friendship status -->
    <div v-if="isPendingRequest" class="flex gap-2 ml-2">
      <button @click="acceptFriendRequest" class="bg-green-600 text-white px-2 py-1 rounded text-xs">
        Accept
      </button>
      <button @click="declineFriendRequest" class="bg-red-600 text-white px-2 py-1 rounded text-xs">
        Decline
      </button>
    </div>
    <button v-else @click="openChat" class="ml-2 bg-[#444444] text-white px-3 py-1 rounded text-xs hover:bg-[#555555]">
      Chat
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  friend: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['accept', 'decline', 'openChat']);

const displayName = computed(() => {
  return props.friend.username || 'Unknown User';
});

const shortFriendId = computed(() => {
  return shortId(props.friend.friend_id);
});

const isPendingRequest = computed(() => {
  return props.friend.status === 'pending' && props.friend.request_type === 'received';
});

function shortId(id: string) {
  if (!id) return '';
  const parts = id.toString().split(':');
  return parts.length > 1 ? parts[1].substring(0, 6) : id.substring(0, 6);
}

function acceptFriendRequest() {
  emit('accept', props.friend.id);
}

function declineFriendRequest() {
  emit('decline', props.friend.id);
}

function openChat() {
  emit('openChat', props.friend.id);
}
</script>