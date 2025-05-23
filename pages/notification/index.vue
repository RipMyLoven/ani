<template>
  <NotificationTemplate />
</template>

<script setup>
import NotificationTemplate from './notificationTemplate.vue';

definePageMeta({
  title: 'Notifications',
  layout: 'main',
  middleware: ['transitions'],
  order: 2,
});
</script>