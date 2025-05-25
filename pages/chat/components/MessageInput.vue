<template>
  <div class="message-input">
    <textarea
      v-model="message"
      @keydown="handleKeydown"
      @input="handleInput"
      placeholder="Type a message..."
      class="input-field"
      rows="1"
    ></textarea>
    <button 
      @click="send" 
      :disabled="!message.trim()"
      class="send-btn"
    >
      Send
    </button>
  </div>
</template>

<script setup>
const emit = defineEmits(['send', 'typing-start', 'typing-stop']);

const message = ref('');
const isTyping = ref(false);
let typingTimeout = null;

const send = () => {
  if (!message.value.trim()) return;
  
  emit('send', message.value.trim());
  message.value = '';
  stopTypingIndicator();
};

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    send();
  }
};

const handleInput = () => {
  if (!isTyping.value) {
    isTyping.value = true;
    emit('typing-start');
  }
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    stopTypingIndicator();
  }, 1000);
};

const stopTypingIndicator = () => {
  if (isTyping.value) {
    isTyping.value = false;
    emit('typing-stop');
  }
  clearTimeout(typingTimeout);
};
</script>

<style scoped>
.message-input {
  display: flex;
  padding: 1rem;
  background: white;
  border-top: 1px solid #e0e0e0;
  gap: 0.5rem;
}

.input-field {
  flex: 1;
  resize: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
  font-family: inherit;
}

.send-btn {
  padding: 0.5rem 1rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>