<template>
  <LoginTemplate />
</template>

<script setup lang="ts">
import LoginTemplate from './loginTemplate.vue';

definePageMeta({
  title: 'Login',
  layout: 'default',
  middleware: ['transitions'],
  order: 1,
});
</script>