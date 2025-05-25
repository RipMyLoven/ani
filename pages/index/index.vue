<template>
    <IndexTemplate />
</template>
  
<script setup lang="ts">
import IndexTemplate from './indexTemplate.vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  title: 'Index Page',
  layout: 'clean',
  middleware: ['fade-transition'],
  order: 1,
});

onMounted(async () => {
  // Проверяем только на клиенте и если store готов
  if (process.client) {
    await nextTick(); // Ждем инициализации store
    
    const authStore = useAuthStore();
    
    // Проверяем только если пользователь не загружен
    if (!authStore.user && !authStore.loading) {
      await authStore.checkAuth();
    }
  }
});
</script>
