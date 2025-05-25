<template>
  <div class="chat-container">
    <!-- Error state -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="retry" class="retry-btn">Retry</button>
    </div>
    
    <!-- Loading state -->
    <div v-else-if="isLoading" class="loading">
      Loading messages...
    </div>
    
    <!-- Chat content -->
    <div v-else class="chat-content">
      <!-- Messages container -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="messages.length === 0" class="no-messages">
          No messages yet. Start the conversation!
        </div>
        
        <div v-else class="messages-list">
          <LeftMessageChat
            v-for="message in messages"
            :key="message.id"
            :message="message"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, provide } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import LeftMessageChat from './components/LeftMessageChat.vue';
import type { Message } from '~/types/chat';

const route = useRoute();
const authStore = useAuthStore();

const chatId = route.query.chatId as string;
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const newMessage = ref('');

const currentUserId = computed(() => authStore.user?.id);
const messagesContainer = ref<HTMLElement>();

onMounted(async () => {
  console.log('[CHAT TEMPLATE] Mounted with chatId:', chatId);
  if (!chatId) {
    error.value = 'No chat ID provided';
    return;
  }
  await loadMessages();
  setupSocketListeners();
});

const loadMessages = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    const response = await $fetch<{ messages: Message[]; hasMore: boolean }>(`/api/chat/messages?chatId=${chatId}`);
    messages.value = response.messages || [];
    
    await nextTick();
    scrollToBottom();
  } catch (err: any) {
    console.error('Failed to load messages:', err);
    error.value = 'Failed to load messages. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const setupSocketListeners = () => {
  try {
    console.log('[CHAT TEMPLATE] Setting up socket listeners for chat:', chatId);
    
    // WebSocket functionality будет добавлена позже
    // Пока что просто логируем
    
  } catch (error) {
    console.warn('WebSocket setup failed:', error);
  }
};

const sendMessage = async (content: string) => {
  if (!content.trim()) return;
  
  console.log('[CHAT TEMPLATE] Sending message:', content);
  
  try {
    const response = await $fetch('/api/chat/messages', {
      method: 'POST',
      body: {
        chatId,
        content: content.trim(),
        messageType: 'text'
      }
    });
    
    if (response.success) {
      // Перезагружаем сообщения
      await loadMessages();
    }
  } catch (error) {
    console.error('Failed to send message:', error);
  }
  
  newMessage.value = '';
};

const startTyping = () => {
  console.log('[CHAT TEMPLATE] Start typing');
};

const stopTyping = () => {
  console.log('[CHAT TEMPLATE] Stop typing');
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const retry = () => {
  loadMessages();
};

// Provide для layout
provide('newMessage', newMessage);
provide('sendMessage', sendMessage);
provide('startTyping', startTyping);
provide('stopTyping', stopTyping);

console.log('[CHAT TEMPLATE] Provided functions to layout');

onUnmounted(() => {
  console.log('[CHAT TEMPLATE] Component unmounted');
});
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #1a1a1a;
}

.error-message {
  background-color: #dc3545;
  color: white;
  padding: 1rem;
  text-align: center;
}

.retry-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  margin-left: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.loading {
  text-align: center;
  color: #888;
  padding: 2rem;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.no-messages {
  text-align: center;
  color: #888;
  padding: 2rem;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>