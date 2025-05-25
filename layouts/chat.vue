<template>
  <div class="chat-layout">
    <!-- Navigation Bar -->
    <NavBarChat />
    
    <!-- Main Chat Content -->
    <div class="chat-main">
      <slot />
    </div>
    
    <!-- Message Input -->
    <NavMenuChat 
      v-model="newMessage"
      @send="sendMessage"
      @focus="startTyping"
      @blur="stopTyping"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';
import NavBarChat from '~/pages/chat/components/NavBarChat.vue';
import NavMenuChat from '~/pages/chat/components/NavMenuChat.vue';

// Получаем функции из chatTemplate через inject
const newMessage = inject('newMessage', ref(''));
const sendMessage = inject('sendMessage', (content: string) => {
  console.log('Send message:', content);
});
const startTyping = inject('startTyping', () => {
  console.log('Start typing');
});
const stopTyping = inject('stopTyping', () => {
  console.log('Stop typing');
});
</script>

<style scoped>
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1a1a1a;
}

.chat-main {
  flex: 1;
  padding-top: 80px; /* Отступ для navbar */
  padding-bottom: 80px; /* Отступ для input */
  overflow: hidden;
}
</style>
