<template>
  <div class="navbar">
    <div class="flex justify-between items-center p-4 fixed top-0 w-full z-50" style="background-color: #1e3046;">
      <!-- Left - Back button -->
      <div class="back-button">
        <nuxt-link to="/home" class="flex items-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </nuxt-link>
      </div>
      
      <!-- Middle - User profile with name and status -->
      <div class="flex items-center">
        <div class="mr-2">
          <div class="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            <span class="text-white text-sm">
              {{ getInitials(chatPartner?.username || 'User') }}
            </span>
          </div>
        </div>
        <div>
          <p class="text-md font-medium text-white">{{ chatPartner?.username || 'User' }}</p>
          <p class="text-sm text-gray-300">{{ typing ? 'Typing...' : 'Online' }}</p>
        </div>
      </div>
      
      <!-- Right - Menu dots with dropdown -->
      <div class="relative">
        <div class="menu-dots" @click="toggleMenu">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        
        <!-- Dropdown menu -->
        <div v-if="isMenuOpen" class="menu-dropdown">
          <div class="menu-item" @click="clearChat">Clear Chat</div>
          <div class="menu-item" @click="blockUser">Block User</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const typing = ref(false);
const isMenuOpen = ref(false);

// Получаем информацию о партнере чата
const chatPartner = computed(() => {
  // Пока что используем заглушку, потом можно получать из чата
  return {
    username: 'Chat Partner'
  };
});

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const clearChat = () => {
  console.log('Clear chat');
  isMenuOpen.value = false;
};

const blockUser = () => {
  console.log('Block user');
  isMenuOpen.value = false;
};

// Close menu when clicking outside
const closeMenuOnClickOutside = (event: MouseEvent) => {
  if (!isMenuOpen.value) return;
  
  const target = event.target as HTMLElement | null;
  if (!target) return;
  
  const isMenuDots = target.closest('.menu-dots');
  const isMenuDropdown = target.closest('.menu-dropdown');
  
  if (!isMenuDots && !isMenuDropdown) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeMenuOnClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenuOnClickOutside);
});
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #1e3046;
  color: white;
}

.back-button {
  cursor: pointer;
  padding: 5px;
}

.menu-dots {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 24px;
  gap: 4px;
  cursor: pointer;
  padding: 8px;
}

.dot {
  width: 4px;
  height: 4px;
  background-color: white;
  border-radius: 50%;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 150px;
  background-color: #27374d;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  overflow: hidden;
}

.menu-item {
  padding: 12px 16px;
  font-size: 14px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>