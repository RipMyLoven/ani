<template>
  <LoginTemplate />
</template>

<script setup lang="ts">
import LoginTemplate from './loginTemplate.vue';
import { useAuthStore } from '~/server/stores/auth';
import { useRouter } from '#app';

const authStore = useAuthStore();
const router = useRouter();

definePageMeta({
  title: 'Login',
  layout: 'default',
  middleware: ['transitions'],
  order: 1,
});

onMounted(async () => {
  if (authStore.user) {
    router.push('/home');
  }
});
</script>