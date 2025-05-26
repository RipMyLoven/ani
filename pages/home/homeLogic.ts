import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
import type { CreateChatResponse } from '~/types/chat';
import type { SocketInstance } from '~/types/socket';

export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'pending' | 'accepted';
  friend_id?: string;
  chatId?: string; // Добавляем поле для хранения ID чата
}

interface FriendsResponse {
  friends: Friend[];
}

interface SearchResponse {
  users: any[];
}

interface ExactMatchResponse {
  user: any;
}

export function useHomeLogic() {
  const authStore = useAuthStore();
  const router = useRouter();
  const friends = ref<Friend[]>([]);
  const pendingRequests = ref<Friend[]>([]);
  const searchTerm = ref('');
  const searchResults = ref<any[]>([]);
  const isSearching = ref(false);
  const error = ref('');
  const friendAddStatus = ref<{ type: 'success' | 'error', message: string } | null>(null);
  const currentChatFriend = ref<Friend | null>(null);
  const chatMessages = ref<{ sender: string; content: string }[]>([]);
  const existingChats = ref<Map<string, string>>(new Map()); // friendId -> chatId

  const allFriends = computed(() => {
    return [
      ...pendingRequests.value,
      ...friends.value
    ];
  });

  async function loadFriends() {
    try {
      const response: FriendsResponse = await $fetch('/api/friends');
      
      if (response && response.friends) {
        friends.value = response.friends.filter(f => f.status === 'accepted');
        pendingRequests.value = response.friends.filter(f => f.status === 'pending');
      }
      
      // Загружаем существующие чаты
      await loadExistingChats();
    } catch (err: any) {
      console.error('Failed to load friends:', err);
      error.value = err.message || 'Failed to load friends';
    }
  }

  async function loadExistingChats() {
    try {
      const response = await $fetch<{ chats: any[] }>('/api/chat');
      
      response.chats.forEach(chat => {
        if (chat.other_participants && chat.other_participants.length > 0) {
          const otherUser = chat.other_participants[0];
          const friendId = otherUser.id.toString().replace(/^user:/, '');
          const chatId = chat.id.toString().replace(/^chat:/, '');
          existingChats.value.set(friendId, chatId);
          
          // Обновляем друзей с информацией о чате
          const friend = friends.value.find(f => 
            f.friend_id?.replace(/^user:/, '') === friendId ||
            f.id?.replace(/^user:/, '') === friendId
          );
          if (friend) {
            friend.chatId = chatId;
          }
        }
      });
    } catch (err) {
      console.error('Failed to load existing chats:', err);
    }
  }

  async function searchUsers() {
    if (!searchTerm.value.trim()) {
      searchResults.value = [];
      return;
    }
    
    isSearching.value = true;
    try {
      const response: SearchResponse = await $fetch('/api/friends/search', {
        query: { q: searchTerm.value }
      });
      searchResults.value = response.users || [];
    } catch (err: any) {
      console.error('Search failed:', err);
      searchResults.value = [];
    } finally {
      isSearching.value = false;
    }
  }

  async function sendFriendRequest(userId: string) {
    try {
      await $fetch('/api/friends', {
        method: 'POST',
        body: { friendId: userId }
      });
      
      friendAddStatus.value = {
        type: 'success',
        message: 'Friend request sent successfully!'
      };
      
      setTimeout(() => {
        friendAddStatus.value = null;
      }, 3000);
      
    } catch (err: any) {
      friendAddStatus.value = {
        type: 'error',
        message: err.data?.message || 'Failed to send friend request'
      };
      
      setTimeout(() => {
        friendAddStatus.value = null;
      }, 3000);
    }
  }

  async function acceptFriendRequest(friendshipId: string) {
    try {
      await $fetch(`/api/friends/${friendshipId}`, {
        method: 'PUT',
        body: { action: 'accept' }
      });
      
      await loadFriends();
      
      friendAddStatus.value = {
        type: 'success',
        message: 'Friend request accepted!'
      };
      
      setTimeout(() => {
        friendAddStatus.value = null;
      }, 3000);
      
    } catch (err: any) {
      friendAddStatus.value = {
        type: 'error',
        message: 'Failed to accept friend request'
      };
      
      setTimeout(() => {
        friendAddStatus.value = null;
      }, 3000);
    }
  }

  async function declineFriendRequest(friendshipId: string) {
    try {
      await $fetch(`/api/friends/${friendshipId}`, {
        method: 'PUT',
        body: { action: 'decline' }
      });
      
      await loadFriends();
    } catch (err: any) {
      console.error('Failed to decline friend request:', err);
    }
  }

  async function addFriendByUsername(username: string) {
    try {
      const exactResponse: ExactMatchResponse = await $fetch('/api/friends/exact-match', {
        query: { username }
      });
      
      if (exactResponse.user) {
        await sendFriendRequest(exactResponse.user.id);
      } else {
        friendAddStatus.value = {
          type: 'error',
          message: 'User not found'
        };
        
        setTimeout(() => {
          friendAddStatus.value = null;
        }, 3000);
      }
    } catch (err: any) {
      friendAddStatus.value = {
        type: 'error',
        message: err.data?.message || 'Failed to add friend'
      };
      
      setTimeout(() => {
        friendAddStatus.value = null;
      }, 3000);
    }
  }

  function handleSearch(term: string) {
    searchTerm.value = term;
    if (term.trim()) {
      searchUsers();
    } else {
      searchResults.value = [];
    }
  }

  function clearSearch() {
    searchTerm.value = '';
    searchResults.value = [];
  }

  async function handleAddFriendByUsername(username: string) {
    await addFriendByUsername(username);
    clearSearch();
  }

  // Обновленная функция openChat
  async function openChat(friendId: string) {
    console.log('[HOME DEBUG] openChat called with friendId:', friendId);

    try {
      const cleanId = friendId.replace(/^user:/, '');
      
      // Проверяем, есть ли уже существующий чат
      const existingChatId = existingChats.value.get(cleanId);
      if (existingChatId) {
        console.log('[HOME DEBUG] Using existing chat:', existingChatId);
        
        // Присоединяемся к чату через WebSocket
        try {
          const { $socket } = useNuxtApp() as { $socket: SocketInstance };
          if ($socket.getInstance()) {
            $socket.emit('join_chat', { chatId: existingChatId });
            console.log('[HOME DEBUG] Joined existing chat via WebSocket');
          }
        } catch (socketError) {
          console.warn('[HOME DEBUG] WebSocket not available for existing chat');
        }
        
        // Переходим к существующему чату
        await router.push(`/chat?chatId=${encodeURIComponent(existingChatId)}`);
        return;
      }

      // Создаем новый чат только если его нет
      const participantId = `user:${cleanId}`;
      const chatResponse = await $fetch<CreateChatResponse>('/api/chat', {
        method: 'POST',
        body: {
          participantId: participantId,
          chatType: 'private'
        }
      });

      console.log('[HOME DEBUG] Chat response:', chatResponse);

      if (!chatResponse?.chat?.id) {
        throw new Error('Failed to create or get chat - no chat ID returned');
      }

      const chatId = chatResponse.chat.id.toString().replace(/^chat:/, '');
      
      // Сохраняем информацию о чате
      existingChats.value.set(cleanId, chatId);
      
      // Обновляем друга с информацией о чате
      const friend = friends.value.find(f => 
        f.friend_id?.replace(/^user:/, '') === cleanId ||
        f.id?.replace(/^user:/, '') === cleanId
      );
      if (friend) {
        friend.chatId = chatId;
      }

      console.log('[HOME DEBUG] Chat ID:', chatId, 'Existing:', chatResponse.existing);
      
      // Присоединяемся к чату через WebSocket
      try {
        const { $socket } = useNuxtApp() as { $socket: SocketInstance };
        if ($socket.getInstance()) {
          $socket.emit('join_chat', { chatId });
          console.log('[HOME DEBUG] Joined chat via WebSocket');
        }
      } catch (socketError) {
        console.warn('[HOME DEBUG] WebSocket not available, continuing without real-time features');
      }
      
      // Переходим к чату
      await router.push(`/chat?chatId=${encodeURIComponent(chatId)}`);
      
    } catch (error: any) {
      console.error('[HOME DEBUG] Failed to open chat:', error);
      
      friendAddStatus.value = {
        type: 'error',
        message: 'Failed to open chat. Please try again.'
      };
      
      setTimeout(() => {
        friendAddStatus.value = null;
      }, 3000);
    }
  }
  
  onMounted(() => {
    if (process.client && authStore.user) {
      loadFriends();
    }
  });
  
  return {
    friends,
    pendingRequests,
    searchTerm,
    searchResults,
    isSearching,
    error,
    friendAddStatus,
    currentChatFriend,
    chatMessages,
    allFriends,
    handleSearch,
    clearSearch,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    handleAddFriendByUsername,
    openChat,
    loadFriends
  };
}