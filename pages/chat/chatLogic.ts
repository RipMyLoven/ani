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
        body: { participantId }
      });
      chat.value = response.chat;
    } catch (err: any) {
      error.value = 'Failed to create/find chat';
    } finally {
      isLoading.value = false;
    }
  };

  // 2. Получить сообщения
  const fetchMessages = async () => {
    if (!chat.value) return;
    try {
      isLoading.value = true;
      error.value = null;
      const response = await $fetch<{ messages: Message[]; hasMore: boolean }>(
        `/api/chat/messages?chatId=${chat.value.id.replace(/^chat:/, '')}`
      );
      messages.value = response.messages || [];
    } catch (err: any) {
      error.value = 'Failed to load messages';
    } finally {
      isLoading.value = false;
    }
  };

  // 3. Polling
  const startPolling = () => {
    if (!chat.value) return;
    fetchMessages();
    pollingInterval = setInterval(fetchMessages, 2000);
  };

  const stopPolling = () => {
    if (pollingInterval) clearInterval(pollingInterval);
  };

  // 4. Отправить сообщение
  const sendMessage = async (content: string) => {
    if (!chat.value || !content.trim()) return;
    try {
      await $fetch('/api/chat/messages', {
        method: 'POST',
        body: {
          chatId: chat.value.id.replace(/^chat:/, ''),
          content: content.trim(),
          messageType: 'text'
        }
      });
      await fetchMessages();
    } catch (err) {
      error.value = 'Failed to send message';
    }
  };

  // 5. Инициализация чата и polling
  const initChat = async () => {
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