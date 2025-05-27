<template>
  <div class="chat-container">
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="loadMessages" class="retry-btn">Retry</button>
    </div>
    <div v-else-if="isLoading" class="loading">
      Loading messages...
    </div>
    <div v-else class="chat-content">
      <div class="messages-container" ref="messagesContainer">
        <div v-if="messages.length === 0" class="no-messages">
          No messages yet. Start the conversation!
        </div>
        <div v-else class="messages-list">
<LeftMessageChat
  v-for="message in messages"
  :key="message.id"
  :message="message"
  :current-user-id="currentUserId"
/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'; // Add computed here
import { useRoute } from 'vue-router';
import LeftMessageChat from './components/LeftMessageChat.vue';
import type { Message } from '~/types/chat';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const messagesContainer = ref<HTMLElement>();
const auth = useAuthStore();
const currentUserId = computed(() =>
  auth.user ? auth.user.id.replace(/^user:/, '') : null
);

const chatId = computed(() => {
  return route.query.chatId as string || route.query.participantId as string;
});

// Функция загрузки сообщений
const loadMessages = async () => {
  if (!chatId.value) {
    error.value = 'No chat ID provided';
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    
    console.log('[chatTemplate] Loading messages for chatId:', chatId.value);
    
    const response = await $fetch<{ messages: Message[] }>(
      `/api/chat/messages?chatId=${chatId.value.replace(/^chat:/, '')}`
    );
    
    messages.value = response.messages || [];
    console.log('[chatTemplate] Messages loaded:', messages.value.length);
    
    // Прокручиваем вниз после загрузки
    nextTick(scrollToBottom);
    
  } catch (err: any) {
    console.error('[chatTemplate] Error loading messages:', err);
    error.value = 'Failed to load messages';
  } finally {
    isLoading.value = false;
  }
};

// Функция прокрутки вниз
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Загружаем сообщения при монтировании
onMounted(() => {
  loadMessages();
  
  // Обновляем сообщения каждые 2 секунды
  setInterval(loadMessages, 2000);
});

// Следим за изменениями сообщений и прокручиваем вниз
watch(messages, (newMessages) => {
  console.log('[chatTemplate] Messages updated:', {
    count: newMessages.length,
    messages: newMessages,
    currentUserId: currentUserId.value
  });
  nextTick(scrollToBottom);
}, { deep: true });
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