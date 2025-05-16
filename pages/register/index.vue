<template>
  <RegisterTemplate />
</template>

<script setup lang="ts">
import RegisterTemplate from './registerTemplate.vue';

definePageMeta({
  title: 'Register',
  layout: 'default',
  middleware: ['transitions'],
  order: 2,
});
</script>