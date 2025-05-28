import { ref } from 'vue';
import type { Chat, Message } from '~/types/chat';

// Create a global state to share between all instances
const globalChatState = {
  chat: ref<Chat | null>(null),
  messages: ref<Message[]>([]),
  isLoading: ref(false),
  error: ref<string | null>(null),
  currentParticipantId: ref<string | null>(null),
  pollingInterval: null as ReturnType<typeof setInterval> | null
};

export function usePollingChat(participantId: string | null) {
  // Use the global state
  const { chat, messages, isLoading, error } = globalChatState;

  // 1. Создать или найти чат
  const ensureChat = async () => {
    if (!participantId) {
      error.value = 'No participant selected';
      return;
    }
    
    // If we already have the right chat, don't recreate it
    if (globalChatState.currentParticipantId.value === participantId && chat.value) {
      console.log('[chatLogic] Using existing chat:', chat.value);
      return;
    }
    
    try {
      isLoading.value = true;
      error.value = null;
      const response = await $fetch<{ chat: Chat; existing: boolean }>('/api/chat', {
        method: 'POST',
        body: { participantId },
        credentials: 'include'
      });
      chat.value = response.chat;
      globalChatState.currentParticipantId.value = participantId;
      console.log('[chatLogic] Chat ensured:', chat.value);
    } catch (err: any) {
      console.error('[chatLogic] Error ensuring chat:', err);
      error.value = 'Failed to create/find chat';
    } finally {
      isLoading.value = false;
    }
  };

  // 2. Получить сообщения
  const fetchMessages = async () => {
    if (!chat.value) {
      console.warn('[chatLogic] No chat available for fetching messages');
      return;
    }
    try {
      const response = await $fetch<{ messages: Message[]; hasMore: boolean }>(
        `/api/chat/messages?chatId=${chat.value.id.replace(/^chat:/, '')}`
      );
      
      const newMessages = response.messages || [];
      console.log('[chatLogic] Fetched messages:', newMessages.length);
      
      // Обновляем только если есть изменения
      if (JSON.stringify(messages.value) !== JSON.stringify(newMessages)) {
        messages.value = newMessages;
        console.log('[chatLogic] Messages updated');
      }
      
    } catch (err: any) {
      console.error('[chatLogic] Error fetching messages:', err);
      error.value = 'Failed to load messages';
    }
  };

  // 3. Polling
  const startPolling = () => {
    if (!chat.value) return;
    
    // Stop existing polling
    if (globalChatState.pollingInterval) {
      clearInterval(globalChatState.pollingInterval);
    }
    
    console.log('[chatLogic] Starting polling');
    fetchMessages();
    globalChatState.pollingInterval = setInterval(fetchMessages, 2000);
  };

  const stopPolling = () => {
    if (globalChatState.pollingInterval) {
      clearInterval(globalChatState.pollingInterval);
      globalChatState.pollingInterval = null;
      console.log('[chatLogic] Polling stopped');
    }
  };

  // 4. Отправить сообщение
  const sendMessage = async (content: string) => {
    console.log('[chatLogic] sendMessage called:', content, chat.value);
    if (!chat.value || !content.trim()) {
      console.warn('[chatLogic] No chat or empty content', chat.value, content);
      return;
    }
    
    try {
      console.log('[chatLogic] Sending message to chat:', chat.value.id);
      await $fetch('/api/chat/messages', {
        method: 'POST',
        body: {
          chatId: chat.value.id.replace(/^chat:/, ''),
          content: content.trim(),
          messageType: 'text'
        },
        credentials: 'include'
      });
      
      console.log('[chatLogic] Message sent successfully');
      
      // Сразу обновляем сообщения после отправки
      await fetchMessages();
      
    } catch (err) {
      console.error('[chatLogic] Error sending message:', err);
      error.value = 'Failed to send message';
    }
  };

  // 5. Инициализация чата и polling
  const initChat = async () => {
    console.log('[chatLogic] Initializing chat for participant:', participantId);
    await ensureChat();
    if (chat.value) {
      await fetchMessages();
      startPolling();
    }
  };

  return {
    chat,
    messages,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
    startPolling,
    stopPolling,
    initChat,
  };
}