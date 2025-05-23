import { ref, onMounted } from 'vue';

// Более полное описание типа
interface Friend {
  id: string;
  username: string;
  status: 'pending' | 'accepted';
  friend_id: string;
  request_type: 'sent' | 'received';
  created_at?: string;
  email?: string;
  // Добавьте дополнительные поля из базы данных
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

  // Загрузка заявок в друзья
  async function loadPendingRequests() {
    isLoading.value = true;
    error.value = '';

    try {
      const response = await $fetch<FriendsResponse>('/api/friends');
      console.log('Notifications - Complete API response:', response);
      
      if (response && response.friends) {
        const allFriends = response.friends;
        
        // Enhanced debug logging
        console.log('All friend relationships:', allFriends.length);
        console.log('Pending status count:', allFriends.filter(f => f.status === 'pending').length);
        console.log('Received type count:', allFriends.filter(f => f.request_type === 'received').length);
        
        // Only keep pending requests that are incoming (received)
        pendingRequests.value = allFriends.filter(
          friend => friend.status === 'pending' && friend.request_type === 'received'
        );
        
        console.log('Final pending requests count:', pendingRequests.value.length);
        console.log('Pending requests details:', pendingRequests.value);
      }
    } catch (err: any) {
      console.error('Error loading friend requests:', err);
      error.value = err.message || 'Failed to load friend requests';
    } finally {
      isLoading.value = false;
    }
  }

  // Принятие заявки в друзья
  async function acceptFriendRequest(friendshipId: string) {
    try {
      await $fetch(`/api/friends/${friendshipId}`, {
        method: 'PUT',
        body: { status: 'accepted' }
      });
      
      // Удалим заявку из списка после принятия
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

  // Отклонение заявки в друзья
  async function declineFriendRequest(friendshipId: string) {
    try {
      await $fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE'
      });
      
      // Удалим заявку из списка после отклонения
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

  // Загрузим заявки при монтировании компонента
  onMounted(() => {
    loadPendingRequests();
  });

  return {
    pendingRequests,
    isLoading,
    error,
    loadPendingRequests,
    acceptFriendRequest,
    declineFriendRequest
  };
}