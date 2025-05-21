<template>
  <div>
    <!-- Navigation Menu -->
    <div class="nav-menu w-full p-3 pb-5 fixed bottom-0" style="background-color: #121212; height: 80px;">
      <div class="nav-menu w-full p-3 pb-5 container mx-auto">
        <transition name="fade" mode="out-in">
          <MainNav :isActive="isActive" />
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from '#app';

const route = useRoute();

const isActive = (path: string): boolean => {
  return route.path === path;
};
</script>

<style scoped>
@keyframes slide-up {
  0%  {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes slide-down {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100%);
  }
}

.invite-slide {
  animation: slide-up 0.5s ease forwards;
  z-index: 90;
}

.slide-enter-active {
  animation: slide-up 0.5s ease forwards;
}

.slide-leave-active {
  animation: slide-down 0.5s ease forwards;
}
.nav-menu {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

.nav-item {
  position: relative;
  display: inline-block;
  color: #888888;
}

.icon-active {
  opacity: 1;
  visibility: visible;
}
</style>
