<template>
  <div>
    <div v-if="isLoading" class="loading-spinner h-screen bg-black absolute justify-center items-center inset-0"></div>
    <div v-else>
      <JourneyScreen :whiteListed="whiteListeds" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useIndexLogic } from './indexLogic';

const { whiteListeds, isLoading } = useIndexLogic();
</script>

<style scoped>
.loading-spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #fff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>