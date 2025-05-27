import { ref } from 'vue';
import type { Chat, Message } from '~/types/chat';

export function usePollingChat(participantId: string | null) {
  const chat = ref<Chat | null>(null);
  const messages = ref<Message[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  // 1. Создать или найти чат
  const ensureChat = async () => {
    if (!participantId) {
      error.value = 'No participant selected';
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
    console.log('[chatLogic] Starting polling');
    fetchMessages();
    pollingInterval = setInterval(fetchMessages, 2000);
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
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