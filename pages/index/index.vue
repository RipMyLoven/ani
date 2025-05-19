<template>
    <IndexTemplate />
</template>
  
<script setup lang="ts">
import IndexTemplate from './indexTemplate.vue';
import { useAuthStore } from '~/server/stores/auth';
definePageMeta({
  title: 'Index Page',
  layout: 'clean',
  middleware: ['fade-transition'],
  order: 1,
});

onMounted(async () => {
  const authStore = useAuthStore();
  await authStore.checkAuth();
});
</script>
  