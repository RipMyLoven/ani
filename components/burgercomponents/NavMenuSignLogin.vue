<template>
  <div>
    <div class="grid grid-cols-2 gap-3 text-center">
      <NuxtLink 
        class="nav-item" 
        to="/login" 
        :class="{ active: isActive('/login') }"
      >
        <div>
          <div class="w-7 h-7 mx-auto flex items-center justify-center"
               :class="{ 'icon-active': isActive('/login'), 'grayscale': !isActive('/login') }">
            <span class="material-icons">person</span>
          </div>
          <p class="mt-1 text-xs">Login</p>
        </div>
      </NuxtLink>

      <NuxtLink 
        class="nav-item" 
        to="/register" 
        :class="{ active: isActive('/register') }"
      >
        <div>
          <div class="w-7 h-7 mx-auto flex items-center justify-center"
               :class="{ 'icon-active': isActive('/register'), 'grayscale': !isActive('/register') }">
            <span class="material-icons">how_to_reg</span>
          </div>
          <p class="mt-1 text-xs">Register</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isActive: {
    type: Function,
    required: true,
  }
});
</script>

<style scoped>
.grayscale {
  filter: grayscale(100%);
  opacity: 0.6;
  transition: filter 0.3s ease, opacity 0.3s ease;
}

.icon-active {
  opacity: 1;
  visibility: visible;
  filter: none;
  color: #4F46E5;
}

.nav-item {
  position: relative;
  display: inline-block;
  color: #888888;
}

.nav-item.active {
  color: #4F46E5;
}

</style>