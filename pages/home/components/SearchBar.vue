<template>
  <div class="flex flex-row items-center bg-[#222222] p-2 sm:p-3 w-full gap-2">
    <div class="relative flex-1">
      <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
        <img src="~/public/assets/icons/search.svg" alt="Search" class="w-5 h-5">
      </div>
      
      <input 
        v-model="searchInput"
        type="text" 
        placeholder="Search or add by username" 
        class="w-full h-12 bg-[#333333] border-none rounded px-10 text-white placeholder-gray-400"
        @input="handleSearch"
      />
    </div>
    
    <button 
      @click="addFriendByUsername"
      class="h-12 bg-blue-600 text-white px-4 rounded text-sm font-medium whitespace-nowrap hover:bg-blue-700"
      :disabled="!canAddFriend"
    >
      Add Friend
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const searchInput = ref('');
let timeoutId: number | null = null;

const emit = defineEmits<{
  'search': [term: string],
  'clear': [],
  'add-friend': [username: string]
}>();

const canAddFriend = computed(() => {
  return searchInput.value && searchInput.value.trim().length >= 3;
});

// Custom debounce implementation
function debouncedEmit(value: string) {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = window.setTimeout(() => {
    if (value && value.length >= 3) {
      emit('search', value);
    }
  }, 300);
}

// Watch for changes in the search input
watch(searchInput, (value) => {
  debouncedEmit(value);
});

function handleSearch() {
  // Clear results if search is empty
  if (!searchInput.value || searchInput.value.length < 3) {
    emit('clear');
  } else {
    debouncedEmit(searchInput.value);
  }
}

function addFriendByUsername() {
  if (canAddFriend.value) {
    emit('add-friend', searchInput.value.trim());
  }
}
</script>