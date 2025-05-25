<template>
  <div class="message-list" ref="messagesContainer">
    <div v-if="hasMore" class="load-more">
      <button @click="$emit('load-more')" class="load-more-btn">
        Load more messages
      </button>
    </div>
    
    <div 
      v-for="message in messages" 
      :key="message.id"
      :class="['message', { 'own-message': message.senderId === currentUserId }]"
    >
      <div class="message-header">
        <span class="sender">{{ message.senderUsername }}</span>
        <span class="timestamp">{{ formatTime(message.createdAt) }}</span>
      </div>
      <div class="message-content">{{ message.content }}</div>
    </div>
    
    <div v-if="typingUsers.length > 0" class="typing-indicator">
      {{ typingUsers.join(', ') }} {{ typingUsers.length === 1 ? 'is' : 'are' }} typing...
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  messages: Array,
  typingUsers: Array,
  hasMore: Boolean
});

const emit = defineEmits(['load-more']);

const authStore = useAuthStore();
const currentUserId = computed(() => authStore.user?.id);

const messagesContainer = ref(null);

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString();
};

watch(() => props.messages.length, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
});
</script>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f5f5f5;
}

.message {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.own-message {
  background: #e3f2fd;
  margin-left: 20%;
}

.message-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.message-content {
  font-size: 0.9rem;
}

.typing-indicator {
  font-style: italic;
  color: #666;
  padding: 0.5rem;
}

.load-more {
  text-align: center;
  margin-bottom: 1rem;
}

.load-more-btn {
  padding: 0.5rem 1rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>