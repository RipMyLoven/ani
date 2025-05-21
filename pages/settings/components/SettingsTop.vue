<template>
  <div class="flex flex-col items-center mt-5">
    <div class="flex items-center w-full mb-2 pl-2">
      <span class="text-2xl font-medium text-white mr-2">Settings</span>
      <span class="text-xl text-gray-300">⚙️</span>
    </div>
    <div class="flex justify-center w-full">
      <img
        class="w-20 h-20 rounded-full object-cover border-4 border-gray-900 mb-2"
        :src="user.avatar"
        alt="User avatar"
      />
    </div>
    <div class="flex gap-3 mt-1">
      <span
        v-for="tag in user.tags"
        :key="tag"
        class="bg-gray-900 text-gray-300 rounded-xl px-4 py-1 text-base font-normal"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
defineProps<{
  user: {
    username: string;
    avatar: string;
    tags: string[];
  }
}>();
</script>