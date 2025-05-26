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
        
        <!-- Typing indicator -->
        <div v-if="typingUsers.length > 0" class="typing-indicator">
          {{ typingUsers.join(', ') }} {{ typingUsers.length === 1 ? 'is' : 'are' }} typing...
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
import type { SocketInstance } from '~/types/socket';

const route = useRoute();
const authStore = useAuthStore();

const chatId = route.query.chatId as string;
const messages = ref<Message[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const newMessage = ref('');
const typingUsers = ref<string[]>([]);
const typingTimeout = ref<NodeJS.Timeout | null>(null);

const currentUserId = computed(() => authStore.user?.id);
const messagesContainer = ref<HTMLElement>();

let socket: SocketInstance | null = null;

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
    
    const { $socket } = useNuxtApp() as { $socket: SocketInstance };
    socket = $socket;
    
    if (!socket.getInstance()) {
      console.warn('[CHAT TEMPLATE] Socket not connected');
      return;
    }
    
    // Присоединяемся к чату
    socket.emit('join_chat', { chatId });
    
    // Слушатели событий
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('chat_joined', (data) => {
      console.log('[CHAT TEMPLATE] Successfully joined chat:', data.chatId);
    });
    
  } catch (error) {
    console.warn('[CHAT TEMPLATE] WebSocket setup failed:', error);
  }
};

const handleNewMessage = (messageData: any) => {
  console.log('[CHAT TEMPLATE] Received new message:', messageData);
  
  // Проверяем, что сообщение для этого чата
  if (messageData.chatId === chatId) {
    const newMsg: Message = {
      id: messageData.id,
      chat_id: messageData.chatId,
      sender_id: messageData.senderId,
      content: messageData.content,
      message_type: messageData.messageType || 'text',
      created_at: messageData.createdAt,
      is_read: false,
      is_edited: false,
      sender_username: messageData.senderUsername
    };
    
    // Проверяем, что сообщение еще не добавлено
    if (!messages.value.find(m => m.id === newMsg.id)) {
      messages.value.push(newMsg);
      nextTick(() => scrollToBottom());
    }
  }
};

const handleUserTyping = (data: any) => {
  console.log('[CHAT TEMPLATE] User typing event:', data);
  
  if (data.isTyping) {
    if (!typingUsers.value.includes(data.username) && data.username !== authStore.user?.username) {
      typingUsers.value.push(data.username);
    }
  } else {
    typingUsers.value = typingUsers.value.filter(user => user !== data.username);
  }
};

const sendMessage = async (content: string) => {
  if (!content.trim()) return;

  console.log('[CHAT TEMPLATE] Sending message:', content);

  try {
    // Отправляем через WebSocket для мгновенного обновления
    if (socket?.getInstance()) {
      socket.emit('send_message', {
        chatId,
        content: content.trim(),
        messageType: 'text'
      });
    }

    // Также отправляем через API для надежности
    await $fetch('/api/chat/messages', {
      method: 'POST',
      body: {
        chatId,
        content: content.trim(),
        messageType: 'text'
      }
    });

  } catch (error) {
    console.error('Failed to send message:', error);
    // Если WebSocket не сработал, перезагружаем сообщения
    await loadMessages();
  }

  newMessage.value = '';
  stopTyping();
};

const startTyping = () => {
  console.log('[CHAT TEMPLATE] Start typing');
  
  if (socket?.getInstance()) {
    socket.emit('typing_start', { chatId });
    
    // Автоматически останавливаем через 3 секунды
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value);
    }
    
    typingTimeout.value = setTimeout(() => {
      stopTyping();
    }, 3000);
  }
};

const stopTyping = () => {
  console.log('[CHAT TEMPLATE] Stop typing');
  
  if (socket?.getInstance()) {
    socket.emit('typing_stop', { chatId });
  }
  
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
    typingTimeout.value = null;
  }
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const retry = () => {
  loadMessages();
  setupSocketListeners();
};

// Provide для layout
provide('newMessage', newMessage);
provide('sendMessage', sendMessage);
provide('startTyping', startTyping);
provide('stopTyping', stopTyping);

console.log('[CHAT TEMPLATE] Provided functions to layout');

onUnmounted(() => {
  console.log('[CHAT TEMPLATE] Component unmounted');
  
  // Отписываемся от событий
  if (socket) {
    socket.off('new_message', handleNewMessage);
    socket.off('user_typing', handleUserTyping);
  }
  
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
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

.typing-indicator {
  padding: 0.5rem;
  font-style: italic;
  color: #888;
  text-align: center;
}
</style>