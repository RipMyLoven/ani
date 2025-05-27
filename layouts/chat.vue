<template>
  <div class="chat-layout">
    <!-- Navigation Bar -->
    <NavBarChat />
    
    <!-- Main Chat Content -->
    <div class="chat-main">
       <NuxtPage />
    </div>
    
    <NavMenuChat
      v-model="newMessage"
      @send="handleSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import NavBarChat from '~/pages/chat/components/NavBarChat.vue';
import NavMenuChat from '~/pages/chat/components/NavMenuChat.vue';
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { usePollingChat } from '../pages/chat/chatLogic';

const route = useRoute();
const participantId = route.query.participantId as string | null;

const {
  sendMessage,
  stopPolling,
  initChat,
} = usePollingChat(participantId);

const newMessage = ref('');

onMounted(async () => {
  await initChat();
});

onUnmounted(() => {
  stopPolling();
});

const handleSendMessage = async (content: string) => {
  console.log('[chat layout] handleSendMessage called with:', content);
  
  if (!content.trim()) {
    console.warn('[chat layout] Empty content');
    return;
  }

  try {
    // Используем sendMessage из composable
    await sendMessage(content);
    newMessage.value = '';
    console.log('[chat layout] Message sent successfully');
    
  } catch (err) {
    console.error('[chat layout] Error sending message:', err);
  }
};
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
