<template>
  <div class="fixed bottom-4 left-0 w-full flex justify-center">
    <button
      class="bg-red-800 hover:bg-red-700 text-white rounded-lg px-8 py-3 text-lg flex items-center gap-2 w-[90%] max-w-xs transition"
      @click="logout"
    >
      <span class="text-2xl">⎋</span>
      Log out
    </button>
  </div>
</template>

<script lang="ts">
defineProps<{
  logout: () => void
}>();
</script>