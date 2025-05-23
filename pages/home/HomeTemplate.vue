<template>
  <div class="flex flex-col items-center w-full max-w-3xl mx-auto px-4">
    <SearchBar 
      @search="handleSearch" 
      @clear="clearSearch" 
      @add-friend="addFriendByUsername" 
    />
    
    <!-- Friend add status message -->
    <div v-if="friendAddStatus" 
      :class="[
        'w-full mt-3 p-2 rounded text-center text-sm',
        friendAddStatus.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      ]">
      {{ friendAddStatus.message }}
    </div>
    
    <!-- Search results -->
    <div v-if="searchResults.length > 0" class="w-full mt-4">
      <h3 class="text-white text-lg font-medium mb-2">Search Results</h3>
      <div v-for="user in searchResults" :key="user.id" class="bg-[#333333] p-3 rounded-lg mb-2 flex justify-between items-center">
        <div class="flex items-center">
          <div class="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
            {{ user.username.charAt(0).toUpperCase() }}
          </div>
          <span class="ml-3 text-white">{{ user.username }}</span>
        </div>
        
        <button 
          v-if="!user.friendStatus" 
          @click="sendFriendRequest(user.id)" 
          class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Add Friend
        </button>
        <span v-else-if="user.friendStatus === 'pending'" class="text-yellow-400 text-sm">Request Sent</span>
        <span v-else-if="user.friendStatus === 'accepted'" class="text-green-400 text-sm">Already Friends</span>
      </div>
    </div>
    
    <!-- Friend requests -->
    <div v-if="pendingRequests.length > 0" class="w-full mt-4">
      <h3 class="text-white text-lg font-medium mb-2">Friend Requests</h3>
      <FriendChat 
        v-for="friend in pendingRequests" 
        :key="friend.id" 
        :friend="friend"
        @accept="acceptFriendRequest"
        @decline="declineFriendRequest"
      />
    </div>
    
    <!-- Friends list -->
    <div v-if="friends.length > 0" class="w-full mt-4">
      <h3 class="text-white text-lg font-medium mb-2">Friends</h3>
      <FriendChat 
        v-for="friend in friends" 
        :key="friend.id" 
        :friend="friend"
        @open-chat="openChat"
      />
    </div>
    
    <!-- No friends message -->
    <div v-if="!isSearching && friends.length === 0 && pendingRequests.length === 0" class="text-center mt-8 text-gray-400">
      <p>You don't have any friends yet.</p>
      <p>Use the search bar to find and add friends.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHomeLogic } from './homeLogic';
import SearchBar from './components/SearchBar.vue';
import FriendChat from './components/FriendChat.vue';

const friendAddStatus = ref<{ type: 'success' | 'error', message: string } | null>(null);

const { 
  friends, 
  pendingRequests,
  searchTerm, 
  searchResults, 
  isSearching,
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest,
  loadFriends,
  searchUsers,
  addFriendByUsername: addFriend
} = useHomeLogic();

function handleSearch(term: string) {
  searchTerm.value = term;
  searchUsers();
}

function clearSearch() {
  searchResults.value = [];
}

// Add friend by username function
async function addFriendByUsername(username: string) {
  try {
    friendAddStatus.value = null;
    const result = await addFriend(username);
    
    if (result.success) {
      friendAddStatus.value = { 
        type: 'success', 
        message: `Friend request sent to ${username}` 
      };
      loadFriends();
    } else {
      // Handle specific error cases
      if (result.message?.includes('already sent') || result.message?.includes('already exists')) {
        friendAddStatus.value = { 
          type: 'error', 
          message: 'You already have a pending request to this user' 
        };
      } else if (result.message?.includes('add yourself')) {
        friendAddStatus.value = { 
          type: 'error', 
          message: "You can't add yourself as a friend" 
        };
      } else {
        friendAddStatus.value = { 
          type: 'error', 
          message: result.message || 'Failed to add friend' 
        };
      }
    }
    
    // Auto-hide status message after 5 seconds
    setTimeout(() => {
      friendAddStatus.value = null;
    }, 5000);
  } catch (error: any) {
    friendAddStatus.value = { 
      type: 'error', 
      message: error.message || 'Failed to add friend' 
    };
    
    // Auto-hide error message after 5 seconds
    setTimeout(() => {
      friendAddStatus.value = null;
    }, 5000);
  }
}

function openChat(friendId: string): void {
  // This will be implemented when you add chat functionality
  console.log('Open chat with friend:', friendId);
}
</script>