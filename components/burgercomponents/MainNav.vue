<template>
  <div>
    <div class="grid grid-cols-3 gap-3 text-center">
      <NuxtLink 
        class="nav-item" 
        to="/home" 
        :class="{ active: isActive('/home') }"
      >
        <div>
          <img 
            class="w-7 mx-auto" 
            :class="{ 'icon-active': isActive('/home'), 'hidden': !isActive('/home') }"
            src="~/public/assets/icons/chat-active.svg" 
            alt=""
          />
          <img 
            class="w-7 mx-auto grayscale" 
            :class="{ 'hidden': isActive('/home') }"
            src="~/public/assets/icons/chat.svg" 
            alt=""
          />
          <p class="mt-1 text-xs">Home</p>
        </div>
      </NuxtLink>

      <NuxtLink 
        class="nav-item" 
        to="/notification" 
        :class="{ active: isActive('/notification') }"
      >
        <div>
          <img 
            class="w-7 mx-auto" 
            :class="{ 'icon-active': isActive('/notification'), 'hidden': !isActive('/notification') }"



            src="~/public/assets/icons/bell-active.svg" 
            alt="notification Active"
          />
          <img 
            class="w-7 mx-auto grayscale" 
            :class="{ 'hidden': isActive('/notification') }"


            src="~/public/assets/icons/bell.svg" 
            alt="notification"
          />
          <p class="mt-1 text-xs">notification</p>
        </div>
      </NuxtLink>

      <NuxtLink 
        class="nav-item" 
        to="/settings" 
        :class="{ active: isActive('/settings') }"
      >
        <div>
          <img 
            class="w-7 mx-auto" 
            :class="{ 'icon-active': isActive('/settings'), 'hidden': !isActive('/settings') }"
            src="~/public/assets/icons/SettingsNoneLogo.svg" 
            alt="settings Active"
          />
          <img 
            class="w-7 mx-auto grayscale" 
            :class="{ 'hidden': isActive('/settings') }"
            src="~/public/assets/icons/SettingsNoneLogo.svg" 
            alt="settings"
          />
          <p class="mt-1 text-xs">Settings</p>
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