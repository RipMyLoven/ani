import { inject, ref, onBeforeUnmount } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '~/stores/auth';
import { useHomeLogic } from '../home/homeLogic';

export interface Message {
  isRight: boolean;
  Anonymous: string;
  TextAnon: string;
  timestamp?: Date | string | number;
  badge?: string;
  avatarSrc?: string;
}

export const useMessages = () => {
  const messages = inject<Ref<Message[]>>('messages', ref([]));

  const isFirstMessage = (message: Message, index: number): boolean => {
    if (index === 0) return true;
    const prev = messages.value[index - 1];
    if (prev.Anonymous !== message.Anonymous) return true;
    // Показывать, если разница во времени больше 5 минут
    const prevTime = new Date(prev.timestamp || 0).getTime();
    const currTime = new Date(message.timestamp || 0).getTime();
    return Math.abs(currTime - prevTime) > 1 * 60 * 1000;
  };

  const isLastMessage = (message: Message, index: number): boolean => {
    return index === messages.value.length - 1 || messages.value[index + 1].Anonymous !== message.Anonymous;
  };

  const isMiddleMessage = (index: number): boolean => {
    return index > 0 && index < messages.value.length - 1;
  };

  return { messages, isFirstMessage, isLastMessage, isMiddleMessage };
};

export const useChatWebSocket = (userId: string) => {
  const socket = ref<Socket | null>(null);
  const messages = ref<any[]>([]);
  const isConnected = ref(false);
  const { messages: uiMessages } = useMessages();
  const authStore = useAuthStore();
  // Import homeLogic to access currentChatFriend
  const { currentChatFriend } = useHomeLogic();
  
  const connect = () => {
    try {
      if (!userId) {
        console.error('Cannot connect to WebSocket: userId is not provided');
        return;
      }

      console.log(`Attempting to connect to WebSocket with userId: ${userId}`);
      
      // Connect to WebSocket server (Socket.io)
      socket.value = io('http://localhost:3001', {
        query: { userId },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.value.on('connect', () => {
        console.log('WebSocket connection established');
        isConnected.value = true;
      });

      // Update event handlers
      socket.value.on('new_message', (message) => {
        console.log('Received new message:', message);
        
        // Add to internal state
        messages.value.push(message);
        
        // Check if we're in the right chat by comparing sender to current chat friend
        const currentChatFriendId = currentChatFriend.value?.id;
        if (message.senderId === currentChatFriendId) {
          // Add to UI
          uiMessages.value.push({
            isRight: false,
            Anonymous: currentChatFriend.value?.username || 'Friend',
            TextAnon: message.content,
            timestamp: message.createdAt || new Date(),
            avatarSrc: currentChatFriend.value?.avatar || undefined
          });
        }
      });
    
      socket.value.on('message_sent', (confirmation) => {
        console.log('Message sent confirmation:', confirmation);
        
        if (confirmation.success) {
          console.log('Message successfully saved to database with ID:', confirmation.id);
        } else {
          console.error('Failed to save message:', confirmation.error);
          // Could add retry logic or show error to user
        }
      });

      socket.value.on('messageReceived', (message: any) => {
        console.log('Message received:', message);
        messages.value.push(message);
      });

      socket.value.on('messageSent', (message: any) => {
        console.log('Message confirmed sent:', message);
        // Update the local message with the server ID if needed
      });

      socket.value.on('disconnect', () => {
        console.log('WebSocket disconnected');
        isConnected.value = false;
      });

      socket.value.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
      
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
    }
  };

  const sendMessage = (recipientId: string, content: string) => {
    if (!socket.value || !socket.value.connected) {
      console.warn('WebSocket not connected, attempting to reconnect...');
      connect();
      return false;
    }
    
    try {
      console.log(`Sending message to ${recipientId}: ${content}`);
      
      // Make sure recipientId is properly formatted
      const formattedRecipientId = recipientId.startsWith('user:') ? 
        recipientId : `user:${recipientId}`;
      
      socket.value.emit('send_message', { 
        recipientId: formattedRecipientId, 
        content 
      });
      
      // Message is added to UI by the caller for immediate feedback
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };
  
  // Initial connection
  connect();

  // Clean up on component unmount
  onBeforeUnmount(() => {
    if (socket.value) {
      socket.value.disconnect();
    }
  });

  return { messages, sendMessage, isConnected };
};
