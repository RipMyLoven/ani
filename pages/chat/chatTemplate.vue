<template>
  <div class="chat-container">
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="retry" class="retry-btn">Retry</button>
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
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, provide } from 'vue';
import { useRoute } from 'vue-router';
import LeftMessageChat from './components/LeftMessageChat.vue';
import { usePollingChat } from './chatLogic';

const route = useRoute();
const participantId = route.query.participantId as string | null; // Используй participantId из URL

const {
  chat,
  messages,
  isLoading,
  error,
  sendMessage,
  startPolling,
  stopPolling,
  initChat,
  fetchMessages
} = usePollingChat(participantId);

const newMessage = ref('');
const messagesContainer = ref<HTMLElement>();

onMounted(async () => {
  await initChat();
  nextTick(scrollToBottom);
});

onUnmounted(() => {
  stopPolling();
});

const handleSendMessage = async (content: string) => {
  await sendMessage(content);
  newMessage.value = '';
  nextTick(scrollToBottom);
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const retry = () => {
  fetchMessages();
};

provide('newMessage', newMessage);
provide('sendMessage', handleSendMessage);
provide('startTyping', () => {});
provide('stopTyping', () => {});
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