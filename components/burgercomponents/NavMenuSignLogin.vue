<template>
  <div>
    <div class="grid grid-cols-2 gap-3 text-center">
      <NuxtLink 
        class="nav-item" 
        to="/login" 
        :class="{ active: isActive('/login') }"
      >
        <div>
          <img 
            class="w-7 mx-auto" 
            :class="{ 'icon-active': isActive('/login'), 'hidden': !isActive('/login') }"
            src="~/public/assets/icons/login-active.svg" 
            alt=""
          />
          <img 
            class="w-7 mx-auto grayscale" 
            :class="{ 'hidden': isActive('/login') }"
            src="~/public/assets/icons/login.svg" 
            alt=""
          />
          <p class="mt-1 text-xs">login</p>
        </div>
      </NuxtLink>

      <NuxtLink 
        class="nav-item" 
        to="/register" 
        :class="{ active: isActive('/register') }"
      >
        <div>
          <img 
            class="w-7 mx-auto" 
            :class="{ 'icon-active': isActive('/register'), 'hidden': !isActive('/register') }"



            src="~/public/assets/icons/register-active.svg" 
            alt="register Active"
          />
          <img 
            class="w-7 mx-auto grayscale" 
            :class="{ 'hidden': isActive('/register') }"


            src="~/public/assets/icons/register.svg" 
            alt="register"
          />
          <p class="mt-1 text-xs">register</p>
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