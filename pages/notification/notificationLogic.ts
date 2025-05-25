import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '~/stores/auth'; // Fixed import path

// Более полное описание типа
interface Friend {
  id: string;
  username: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  request_type: 'sent' | 'received';
  created_at: string;
  friend_id: string;
}

interface FriendsResponse {
  friends: Friend[];
}

export function useNotificationLogic() {
  const pendingRequests = ref<Friend[]>([]);
  const isLoading = ref(false);
  const error = ref('');
  const actionStatus = ref<{ type: 'success' | 'error', message: string } | null>(null);

  const debugInfo = computed(() => {
    return JSON.stringify({
      pendingRequestsCount: pendingRequests.value.length,
      pendingRequests: pendingRequests.value,
      isLoading: isLoading.value,
      error: error.value
    }, null, 2);
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

  async function handleAccept(friendshipId: string) {
    try {
      await $fetch(`/api/friends/${friendshipId}`, {
        method: 'PUT',
        body: { status: 'accepted' }
      });

      actionStatus.value = { type: 'success', message: 'Friend request accepted!' };
      
      // Remove from pending requests
      pendingRequests.value = pendingRequests.value.filter(req => req.id !== friendshipId);
      
      // Auto-hide status after 3 seconds
      setTimeout(() => {
        actionStatus.value = null;
      }, 3000);

    } catch (err: any) {
      console.error('Error accepting friend request:', err);
      actionStatus.value = { type: 'error', message: 'Failed to accept friend request' };
      
      setTimeout(() => {
        actionStatus.value = null;
      }, 3000);
    }
  }

  async function handleDecline(friendshipId: string) {
    try {
      await $fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE'
      });

      actionStatus.value = { type: 'success', message: 'Friend request declined' };
      
      // Remove from pending requests
      pendingRequests.value = pendingRequests.value.filter(req => req.id !== friendshipId);
      
      // Auto-hide status after 3 seconds
      setTimeout(() => {
        actionStatus.value = null;
      }, 3000);

    } catch (err: any) {
      console.error('Error declining friend request:', err);
      actionStatus.value = { type: 'error', message: 'Failed to decline friend request' };
      
      setTimeout(() => {
        actionStatus.value = null;
      }, 3000);
    }
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
    handleAccept,
    handleDecline
  };
}