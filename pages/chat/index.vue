<template>
  <NuxtLayout name="chat">
    <ChatTemplate />
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { useAuthStore } from '~/stores/auth';
import ChatTemplate from './chatTemplate.vue';

definePageMeta({
  title: 'Chat',
  layout: 'chat',
});

const authStore = useAuthStore();

// Проверяем аутентификацию
if (process.client && !authStore.user) {
  await navigateTo('/login');
}
</script>
