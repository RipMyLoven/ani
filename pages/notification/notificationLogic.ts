import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

// Более полное описание типа
interface Friend {
  id: string;
  username: string;
  status: 'pending' | 'accepted';
  friend_id: string;
  request_type: 'sent' | 'received';
  created_at?: string;
  email?: string;
  in?: string;
  out?: string;
  recipient_id?: string;
}

interface FriendsResponse {
  friends: Friend[];
}

export function useNotificationLogic() {
  const pendingRequests = ref<Friend[]>([]);
  const isLoading = ref(false);
  const error = ref('');
  const actionStatus = ref<{type: 'success' | 'error', message: string} | null>(null);
  const authStore = useAuthStore();

  const debugInfo = computed(() => {
    return {
      currentUser: authStore.user?.username,
      pendingRequestsCount: pendingRequests.value.length,
      pendingRequests: pendingRequests.value
    };
  });

  async function loadPendingRequests() {
    isLoading.value = true;
    error.value = '';

    try {
      const response = await $fetch<FriendsResponse>('/api/friends');
      console.log('Notifications - Complete API response:', response);
      
      if (response && response.friends) {
        const allFriends = response.friends;
        
        pendingRequests.value = allFriends.filter(
          friend => friend.status === 'pending' && friend.request_type === 'received'
        );
        
      }
    } catch (err: any) {
      console.error('Error loading friend requests:', err);
      error.value = err.message || 'Failed to load friend requests';
    } finally {
      isLoading.value = false;
    }
  }

  async function acceptFriendRequest(friendshipId: string) {
    try {
      await $fetch(`/api/friends/${friendshipId}`, {
        method: 'PUT',
        body: { status: 'accepted' }
      });
      
      pendingRequests.value = pendingRequests.value.filter(req => req.id !== friendshipId);
      
      return { success: true };
    } catch (err: any) {
      console.error('Ошибка при принятии заявки в друзья:', err);
      return { 
        success: false, 
        message: err.message || 'Не удалось принять заявку в друзья' 
      };
    }
  }

  async function declineFriendRequest(friendshipId: string) {
    try {
      await $fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE'
      });
      
      pendingRequests.value = pendingRequests.value.filter(req => req.id !== friendshipId);
      
      return { success: true };
    } catch (err: any) {
      console.error('Ошибка при отклонении заявки в друзья:', err);
      return { 
        success: false, 
        message: err.message || 'Не удалось отклонить заявку в друзья' 
      };
    }
  }

  async function handleAccept(friendshipId: string) {
    const result = await acceptFriendRequest(friendshipId);
    
    if (result.success) {
      actionStatus.value = {
        type: 'success',
        message: 'Запрос в друзья принят'
      };
    } else {
      actionStatus.value = {
        type: 'error',
        message: result.message || 'Ошибка при принятии запроса'
      };
    }
    
    setTimeout(() => {
      actionStatus.value = null;
    }, 3000);
  }

  async function handleDecline(friendshipId: string) {
    const result = await declineFriendRequest(friendshipId);
    
    if (result.success) {
      actionStatus.value = {
        type: 'success',
        message: 'Запрос в друзья отклонен'
      };
    } else {
      actionStatus.value = {
        type: 'error',
        message: result.message || 'Ошибка при отклонении запроса'
      };
    }
    
    setTimeout(() => {
      actionStatus.value = null;
    }, 3000);
  }

  onMounted(() => {
    loadPendingRequests();
  });

  return {
    pendingRequests,
    isLoading,
    error,
    actionStatus,
    debugInfo,
    loadPendingRequests,
    acceptFriendRequest,
    declineFriendRequest,
    handleAccept,
    handleDecline
  };
}