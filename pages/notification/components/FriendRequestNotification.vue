<template>
  <div class="mb-4">
    <!-- Время уведомления -->
    <div class="text-xs text-gray-500 text-center mb-1">
      {{ formattedDate }}
    </div>
    
    <!-- Контент уведомления -->
    <div class="flex">
      <!-- Аватар отправителя -->
      <div class="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2">
        {{ request.username.charAt(0).toUpperCase() }}
      </div>
      
      <!-- Содержимое уведомления -->
      <div class="flex-1">
        <div class="bg-[#333333] rounded-lg p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-white">{{ request.username }}</span>
          </div>
          <p class="text-gray-300">
            Хочет добавить вас в друзья
          </p>
        </div>
        
        <!-- Кнопки действий -->
        <div class="flex mt-2 gap-2">
          <button 
            @click="accept" 
            class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            :disabled="isLoading"
          >
            Принять
          </button>
          <button 
            @click="decline" 
            class="flex-1 bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition-colors"
            :disabled="isLoading"
          >
            Отклонить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({
  request: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['accept', 'decline']);
const isLoading = ref(false);

// Форматируем дату
const formattedDate = computed(() => {
  if (!props.request.created_at) return '';
  
  try {
    const date = new Date(props.request.created_at);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return '';
  }
});

async function accept() {
  isLoading.value = true;
  try {
    await emit('accept', props.request.id);
  } finally {
    isLoading.value = false;
  }
}

async function decline() {
  isLoading.value = true;
  try {
    await emit('decline', props.request.id);
  } finally {
    isLoading.value = false;
  }
}
</script>