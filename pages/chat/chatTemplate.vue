<template>
  <div class="chat-container">
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="initChat" class="retry-btn">Retry</button>
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
import { ref, watch, nextTick, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import LeftMessageChat from './components/LeftMessageChat.vue';
import { useAuthStore } from '~/stores/auth';
import { usePollingChat } from './chatLogic';

const route = useRoute();
const messagesContainer = ref<HTMLElement>();
const auth = useAuthStore();

const currentUserId = computed(() =>
  auth.user ? auth.user.id.replace(/^user:/, '') : null
);

const participantId = computed(() => route.query.participantId as string || null);

// Use the shared chat logic
const { messages, isLoading, error, initChat, stopPolling } = usePollingChat(participantId.value);

// Initialize chat when component mounts
onMounted(async () => {
  if (participantId.value) {
    console.log('[chatTemplate] Initializing chat for participant:', participantId.value);
    await initChat();
  }
});

// Stop polling when component unmounts
onBeforeUnmount(() => {
  stopPolling();
});

// Function to scroll to bottom
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Watch for message changes and scroll to bottom
watch(messages, (newMessages) => {
  console.log('[chatTemplate] Messages updated:', {
    count: newMessages.length,
    messages: newMessages,
    currentUserId: currentUserId.value
  });
  nextTick(scrollToBottom);
}, { deep: true });

// Watch for participant changes
watch(participantId, async (newParticipantId) => {
  if (newParticipantId) {
    console.log('[chatTemplate] Participant changed, reinitializing chat:', newParticipantId);
    await initChat();
  }
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