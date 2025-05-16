<template>
  <div class="flex items-center relative">
    <p class="text-2xl">{{ linkName }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'BurgerMenu',
  props: {
    linkName: {
      type: String,
      default: 'Default Text'
    }
  },
  setup() {
    const isOpen = ref(false);

    const toggleMenu = () => {
      isOpen.value = !isOpen.value;
    };

    return {
      isOpen,
      toggleMenu
    };
  }
});
</script>




<style scoped>
svg {
  stroke: white;
  stroke-width: 2;
  transition: all 0.3s ease;
}

.line {
  transition: all 0.3s ease;
}

.line1 {
  transform-origin: 50% 50%;
}

.line3 {
  transform-origin: 50% 50%;
}

.burger-icon .line1 {
  transform: translateY(0) rotate(0);
}

.burger-icon .line2 {
  opacity: 1;
  transform: translateY(0) rotate(0);
}

.burger-icon .line3 {
  transform: translateY(0) rotate(0);
}

.isOpen .line1 {
  transform: translateX(-4px) translateY(4.5px) rotate(45deg);
}

.isOpen .line2 {
  opacity: 0;
  transform: translateX(12px) translateY(-5px) rotate(45deg);
}

.isOpen .line3 {
  transform: translateX(-4px) translateY(-4px) rotate(-45deg);
}

.icon-menu {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: absolute;
  top: 50px; /* Adjust based on your needs */
  left: 1px; /* Move it 1px to the right */
  background: #333;
  padding: 10px;
  border-radius: 8px;
  z-index: 999; /* Add this line */
}

.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.icon-menu img {
  width: auto; /* Maintain aspect ratio */
  height: 32px; /* Set height, width will adjust automatically */
  object-fit: contain; /* Ensure images fit within their containers */
}

.font-bold {
  font-weight: bold;
}

.underline {
  text-decoration: underline;
}
</style>
