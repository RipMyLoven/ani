<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Friendship Debug View</h1>
    <pre class="bg-gray-800 p-4 rounded overflow-auto max-h-screen">{{ friendships }}</pre>
  </div>
</template>

<script setup>
const { data } = await useFetch('/api/debug/raw-friendships');
const friendships = data;
</script>