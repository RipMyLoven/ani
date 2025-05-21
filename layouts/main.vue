<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 container mx-auto">
    <div class="flex justify-center items-center">
      <!--
        <MainPcNavmenu class="hidden lg:block"/>
        -->

    </div>

    <div class="flex flex-col h-screen overflow-y-auto over container mx-auto">
      <div class="flex-1 p-4 lg:p-0">
          <!-- Main content area 
          <MainBurgerNavbar class="block lg:hidden"/>
          -->
          
        <transition name="slide-left" mode="out-in">
          <div>
            <NuxtPage />
          </div>
        </transition>
      </div>
    </div>
    
    <MainNavMenu class="block lg:hidden" />
  </div>
</template>

<script setup>
</script>

<style>
.over::-webkit-scrollbar {
  display: none;
}

.z-400 {
  z-index: 400;
}

.over {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.container-other {
  padding-bottom: 80px;
}

@media (min-width: 1024px) { 
  .container-referrals,
  .container-other {
    padding-bottom: 0;
  }
}
</style>