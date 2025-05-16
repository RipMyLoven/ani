<template>
  <transition name="fade" mode="out-in">
    <div :key="route.path">
      <BurgerMenu :linkName="dynamicLinkName" />
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from '#app';

const route = useRoute();

const linkNameMapping = {
  '/login': 'Login',
  '/register': 'Register',
};

function getLinkName(path) {
  return linkNameMapping[path] || 'Unknown';
}
const dynamicLinkName = computed(() => getLinkName(route.path));

</script>

