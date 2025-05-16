<template>
  <div class="nav-menu">
    <div class="text-start flex flex-col justify-center gap-4">
      <NuxtLink 
        class="nav-item" 
        to="/register" 
        :class="{ active: isActive('/register') }"
      >
        <div class="flex flex-row justify-start items-center w-full h-full">
          <div
            class="w-7 mr-2"
            :class="{ 'icon-active': isActive('/register'), 'grayscale': !isActive('/register') }"
          ></div>
          <p class="text-lg h-full">Register</p>
        </div>
      </NuxtLink>

      <NuxtLink 
        class="nav-item" 
        to="/login" 
        :class="{ active: isActive('/login') }"
      >
        <div class="flex flex-row justify-start items-center h-full">
          <div
            class="w-7 mr-2"
            :class="{ 'icon-active': isActive('/login'), 'grayscale': !isActive('/login') }"
          ></div>
          <p class="text-lg h-full">Login</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from '#app';

const route = useRoute();

const isActive = (path: string): boolean => {
  return route.path.startsWith(path);
};

</script>
<style scoped>
.nav-menu {
  z-index: 400;
  position: relative;
}
.grayscale {
  filter: grayscale(100%);
  opacity: 0.6;
  transition: filter 0.3s ease, opacity 0.3s ease;
}
.nav-item {
  position: relative;
  display: inline-block;
  color: #888888;
}

.icon-active {
  opacity: 1;
  visibility: visible;
  filter: none;
}

.settings-links {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  padding-top: 14px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.faded-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.faded-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.faded-enter-from {
  opacity: 0;
  transform: translateX(-100px) scale(0);
}

.faded-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0);
}
</style>
