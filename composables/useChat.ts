import { useSocket } from "./useSocket";
import type { Chat, Message, CreateChatRequest, CreateChatResponse } from '~/types/chat';

export const useChat = () => {
  const messages = ref<Message[]>([]);
  const chats = ref<Chat[]>([]);
  const currentChat = ref<Chat | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  const socket = useSocket();
  
  const getChats = async (): Promise<{ chats: Chat[] }> => {
    try {
      isLoading.value = true;
      const response = await $fetch<{ chats: Chat[] }>('/api/chat');
      chats.value = response.chats;
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to get chats';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  const createChat = async (data: CreateChatRequest): Promise<CreateChatResponse> => {
    try {
      isLoading.value = true;
      const response = await $fetch<CreateChatResponse>('/api/chat', {
        method: 'POST',
        body: data
      });
      
      if (!response.existing) {
        chats.value.unshift(response.chat);
      }
      
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to create chat';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  const getChatMessages = async (chatId: string): Promise<{ messages: Message[]; hasMore: boolean }> => {
    try {
      isLoading.value = true;
      const response = await $fetch<{ messages: Message[]; hasMore: boolean }>('/api/chat/messages', {
        query: { chatId }
      });
      messages.value = response.messages;
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to get messages';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };
  
  const addMessage = (message: Message) => {
    messages.value.push(message);
  };
  
  const joinChat = (chatId: string) => {
    currentChatId.value = chatId;
    socket.joinChat(chatId);
  };
  
  const sendMessage = (content: string) => {
    if (!currentChatId.value) return;
    socket.sendMessage(currentChatId.value, content);
  };
  
  const startTyping = () => {
    if (!currentChatId.value) return;
    socket.startTyping(currentChatId.value);
  };
  
  const stopTyping = () => {
    if (!currentChatId.value) return;
    socket.stopTyping(currentChatId.value);
  };
  
  const handleNewMessage = (messageData: any) => {
    if (messageData.chatId === currentChatId.value) {
      messages.value.push(messageData);
    }
  };
  
  const handleUserTyping = (data: any) => {
    if (data.isTyping) {
      if (!typingUsers.value.includes(data.username)) {
        typingUsers.value.push(data.username);
      }
    } else {
      typingUsers.value = typingUsers.value.filter(user => user !== data.username);
    }
  };
  
  onMounted(() => {
    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
  });
  
  onUnmounted(() => {
    socket.off('new_message', handleNewMessage);
    socket.off('user_typing', handleUserTyping);
  });
  
  return {
    messages: readonly(messages),
    chats: readonly(chats),
    currentChat: readonly(currentChat),
    isLoading: readonly(isLoading),
    error: readonly(error),
    getChats,
    createChat,
    getChatMessages,
    addMessage,
    setCurrentChat: (chat: Chat | null) => {
      currentChat.value = chat;
    }
  };
};