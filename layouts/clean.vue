<template>
  <div class="flex flex-col h-screen overflow-y-auto">
    <div class="flex-1">
      <transition name="page" mode="out-in">
        <div class="h-screen" key="page">
          <NuxtPage />
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
// Удалил ненужный код
</script>

<style>

body {
  margin: 0;
  padding: 0;
  background-color: #1E1E1E;
  color: white;
}
</style>
