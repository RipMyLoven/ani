

<template>
  <div>
    <div class="grid grid-cols-4 gap-3 text-center">
      <NuxtLink 
        class="nav-item" 
        to="/home" 
        :class="{ active: isActive('/home') }"
      >
        <div>
          <img 
            class="w-7 mx-auto" 
            :class="{ 'icon-active': isActive('/home'), 'hidden': !isActive('/home') }"
            src="~/assets/icons2/armchair-active.svg" 
            alt=""
          />
          <img 
            class="w-7 mx-auto grayscale" 
            :class="{ 'hidden': isActive('/home') }"
            src="~/assets/icons2/armchair.svg" 
            alt=""
          />
          <p class="mt-1 text-xs">Home</p>
        </div>
      </NuxtLink>

      <NuxtLink 
        class="nav-item" 
        to="/tasks" 
        :class="{ active: isActive('/tasks') }"
      >
        <div>
          <img 
            class="w-7 mx-auto" 
            :class="{ 'icon-active': isActive('/tasks'), 'hidden': !isActive('/tasks') }"



            src="~/assets/icons2/checklist-active.svg" 
            alt="Tasks Active"
          />
          <img 
            class="w-7 mx-auto grayscale" 
            :class="{ 'hidden': isActive('/tasks') }"


            src="~/assets/icons2/checklist.svg" 
            alt="Tasks"
          />
          <p class="mt-1 text-xs">Tasks</p>
        </div>
      </NuxtLink>

      <NuxtLink 
        class="nav-item" 
        to="/friends" 
        :class="{ active: isActive('/friends') }"
      >
        <div>
          <img 
            class="w-7 mx-auto" 
            :class="{ 'icon-active': isActive('/friends'), 'hidden': !isActive('/friends') }"
            src="~/assets/icons2/masks-active.svg" 
            alt="Friends Active"
          />
          <img 
            class="w-7 mx-auto grayscale" 
            :class="{ 'hidden': isActive('/friends') }"
            src="~/assets/icons2/masks.svg" 
            alt="Friends"
          />
          <p class="mt-1 text-xs">Friends</p>
        </div>
      </NuxtLink>

      <NuxtLink 
        class="nav-item" 
        to="/referrals" 
        :class="{ active: isActive('/referrals') }"
      >
        <div>
          <img 
            class="w-7 mx-auto" 
            :class="{ 'icon-active': isActive('/referrals'), 'hidden': !isActive('/referrals') }"
            src="~/assets/icons2/link-active.svg" 
            alt="Friends Active"
          />
          <img 
            class="w-7 mx-auto grayscale" 
            :class="{ 'hidden': isActive('/referrals') }"
            src="~/assets/icons2/link.svg" 
            alt="Friends"
          />
          <p class="mt-1 text-xs">Loungers</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts">


export default defineComponent({
  props: {
    isActive: {
      type: Function,
      required: true,
    },
    showInviteButton: {
      type: Boolean,
      required: true,
    },
    isSettingsPage: {
      type: Boolean,
      required: true,
    },
  },






});

</script>
<style>
.grayscale {
  filter: grayscale(100%);
  opacity: 0.6; /* для легкого затемнения */
  transition: filter 0.3s ease, opacity 0.3s ease; /* плавный переход */
}
</style>