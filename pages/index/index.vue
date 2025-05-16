<template>
    <IndexTemplate />
</template>
  
<script setup lang="ts">
import IndexTemplate from './indexTemplate.vue';
definePageMeta({
  title: 'Index Page',
  layout: 'clean',
  middleware: ['fade-transition'],
  order: 1,
});
</script>
  