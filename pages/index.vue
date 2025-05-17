<template>
  <div class="flex justify-center items-center min-h-screen">
    <p>Перенаправление...</p>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';
import { useRouter } from '#app';

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/home');
  } else {
    router.push('/login');
  }
});
</script>