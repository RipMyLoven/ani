<template>
  <div class="z-100">
    <div class="flex items-center justify-between py-2 pr-2 bg-[#121212] fixed bottom-0 w-full">
      <div class="chat-wrappers w-full">
        <textarea
          ref="textareaRef"
          v-model="localNewMessage"
          class="chat-inputs rounded-full"
          rows="1"
          @keydown.enter.prevent="handleEnterKey"
          @input="adjustHeight"
          @focus="handleFocus"
          @blur="handleBlur"
          placeholder="Type a message..."
        ></textarea>
      </div>
      <button
        @click="sendMessage"
        class="flex items-center justify-center p-1 w-11 h-10 rounded-full overflow-hidden bg-[#7DA9FF]"
        :class="{'opacity-50': !canSend}"
        :disabled="!canSend"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  send: [message: string];
  'update:modelValue': [value: string];
  focus: [];
  blur: [];
}>();

const textareaRef = ref<HTMLTextAreaElement>();
const localNewMessage = ref(props.modelValue || '');

watch(
  () => props.modelValue,
  (newValue) => {
    localNewMessage.value = newValue || '';
  }
);

watch(
  localNewMessage,
  (newValue) => {
    emit('update:modelValue', newValue);
  }
);

const canSend = computed(() => {
  return (localNewMessage.value || '').trim().length > 0;
});

const sendMessage = () => {
  const message = (localNewMessage.value || '').trim();
  console.log('[NAV MENU CHAT] Sending message:', message);
  if (message) {
    emit('send', message);
    localNewMessage.value = '';
    resetHeight();
  }
};

const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) return;
  event.preventDefault();
  sendMessage();
};

const handleFocus = () => {
  console.log('[NAV MENU CHAT] Focus');
  emit('focus');
};

const handleBlur = () => {
  console.log('[NAV MENU CHAT] Blur');
  emit('blur');
};

const adjustHeight = () => {
  nextTick(() => {
    const textarea = textareaRef.value;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
    }
  });
};

const resetHeight = () => {
  nextTick(() => {
    const textarea = textareaRef.value;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = '40px';
    }
  });
};
</script>

<style>
.z-100 {
  z-index: 1000;
}

.chat-wrappers {
  display: flex;
  border-radius: 0.5rem;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 50;
  height: auto;
  padding: 0.5rem;
}

.chat-inputs {
  background-color: #1B1C1E;
  width: 100%;
  border: none;
  outline: none;
  flex: 1;
  resize: none;
  color: white;
  padding: 0.5rem;
  min-height: 40px;
  line-height: 1.5;
}
</style>
