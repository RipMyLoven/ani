<template>
  <HomeTemplate />
</template>

<script setup>
import HomeTemplate from './HomeTemplate.vue';

definePageMeta({
  title: 'Index Page',
  layout: 'main',
  middleware: ['fade-transition'],
  order: 1,
});
</script>