<template>
  <div class="flex flex-col items-center w-full max-w-3xl mx-auto px-4">
    <SearchBar 
      @search="handleSearch" 
      @clear="clearSearch" 
      @add-friend="handleAddFriendByUsername" 
    />
    
    <!-- Friend add status message -->
    <div v-if="friendAddStatus" 
      :class=" [
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
import { useHomeLogic } from './homeLogic';
import SearchBar from './components/SearchBar.vue';
import FriendChat from './components/FriendChat.vue';

const { 
  friends,
  pendingRequests,
  searchResults,
  isSearching,
  friendAddStatus,
  handleSearch,
  clearSearch,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  handleAddFriendByUsername,
  openChat
} = useHomeLogic();
</script>