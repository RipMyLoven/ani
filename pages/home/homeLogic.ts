import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '~/server/stores/auth';

export interface Friend {
  id: string;
  username: string;
  avatar?: string;
  status: 'pending' | 'accepted' | 'online' | 'offline';
  requestType?: 'sent' | 'received';
  lastMessage?: string;
}

interface FriendsResponse {
  friends: Friend[];
}

interface SearchResponse {
  users: any[];
}

// Add this new interface for the exact match response
interface ExactMatchResponse {
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
}

export function useHomeLogic() {
  const authStore = useAuthStore();
  const friends = ref<Friend[]>([]);
  const pendingRequests = ref<Friend[]>([]);
  const searchTerm = ref('');
  const searchResults = ref<any[]>([]);
  const isSearching = ref(false);
  const error = ref('');

  const allFriends = computed(() => {
    return [
      ...pendingRequests.value,
      ...friends.value
    ];
  });

  async function loadFriends() {
    try {
      const response = await $fetch<FriendsResponse>('/api/friends');
      if (response && response.friends) {
        friends.value = response.friends.filter((friend: Friend) => friend.status === 'accepted');
        
        pendingRequests.value = response.friends.filter(
          (friend: Friend) => friend.status === 'pending'
        );
      }
    } catch (err: any) {
      console.error('Error loading friends:', err);
      error.value = err.message || 'Failed to load friends';
    }
  }

  async function searchUsers() {
    if (searchTerm.value.trim().length < 3) {
      searchResults.value = [];
      return;
    }

    isSearching.value = true;
    
    try {
      const response = await $fetch<SearchResponse>(`/api/users/search?term=${searchTerm.value.trim()}`);
      searchResults.value = response?.users || [];
    } catch (err: any) {
      console.error('Error searching users:', err);
      error.value = err.message || 'Failed to search users';
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
      
      // Update search results to show pending status
      const userIndex = searchResults.value.findIndex(user => user.id === userId);
      if (userIndex >= 0) {
        searchResults.value[userIndex].friendStatus = 'pending';
      }
      
      // Reload friends to get updated list
      await loadFriends();
    } catch (err: any) {
      console.error('Error sending friend request:', err);
      error.value = err.message || 'Failed to send friend request';
    }
  }

  async function acceptFriendRequest(friendshipId: string) {
    try {
      await $fetch(`/api/friends/${friendshipId}`, {
        method: 'PUT',
        body: { status: 'accepted' }
      });
      
      await loadFriends();
    } catch (err: any) {
      console.error('Error accepting friend request:', err);
      error.value = err.message || 'Failed to accept friend request';
    }
  }

  async function declineFriendRequest(friendshipId: string) {
    try {
      await $fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE'
      });
      
      await loadFriends();
    } catch (err: any) {
      console.error('Error declining friend request:', err);
      error.value = err.message || 'Failed to decline friend request';
    }
  }

  async function addFriendByUsername(username: string) {
    try {
      // Use the new interface for the exact match response
      const searchResponse = await $fetch<ExactMatchResponse>(`/api/users/exact-match?username=${encodeURIComponent(username.trim())}`);
      const exactMatch = searchResponse?.user;
      
      if (!exactMatch) {
        return { success: false, message: `User "${username}" not found` };
      }
      
      // Check if this user is the current user
      if (exactMatch.id === authStore.user?.id || 
          exactMatch.id.toString() === authStore.user?.id.toString() ||
          exactMatch.username.toLowerCase() === authStore.user?.username.toLowerCase()) {
        return { success: false, message: "You can't add yourself as a friend" };
      }
      
      // Send friend request
      await $fetch('/api/friends', {
        method: 'POST',
        body: { friendId: exactMatch.id }
      });
      
      return { success: true };
    } catch (err: any) {
      console.error('Error adding friend by username:', err);
      error.value = err.message || 'Failed to add friend';
      
      if (err.data?.message?.includes('already exists')) {
        return { success: false, message: 'You already sent a friend request to this user' };
      }
      
      return { success: false, message: err.message || 'Failed to add friend' };
    }
  }

  onMounted(() => {
    if (authStore.user) {
      loadFriends();
    }
  });

  return {
    friends,
    pendingRequests,
    allFriends,
    searchTerm,
    searchResults,
    isSearching,
    error,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    loadFriends,
    addFriendByUsername
  };
}