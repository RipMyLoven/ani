<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 container mx-auto">
    <div class="flex justify-center items-center">
      <PcNavmenu class="hidden lg:block"/>
    </div>

    <div :class="[containerClass, 'flex', 'flex-col', 'h-screen', 'overflow-y-auto', 'over','container','mx-auto']">
      <div class="flex-1 p-4 lg:p-0">
        <BurgerNavbar class="block lg:hidden"/>
        <transition name="slide-left" mode="out-in">
          <div>
            <NuxtPage key="page" @open="showModal" />
          </div>
        </transition>
      </div>
    </div>


    <div class="modal-container absolute bottom-0  right-0 left-0 lg:relative flex justify-center items-center z-400">
      <GlobalModal 
        v-if="isModalOpen" 
        @close="closeModal" 
        :modalType="modalType" 
        :typeId="id" 
        class="w-full"
      />
    </div>
    
    <NavMenu class="block lg:hidden" />
    <Logger/>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, watch, computed, onBeforeMount } from 'vue';

const isModalOpen = ref(false);
const modalType = ref<'friend' | 'referral' | 'task'>('referral');
const id = ref('');

const showModal = (typeId: string, typeModal: 'friend' | 'referral' | 'task') => {
  isModalOpen.value = true;
  modalType.value = typeModal; 
  id.value = typeId; 
};

const closeModal = () => {
  isModalOpen.value = false;
};

provide('modal', {
  isModalOpen,
  showModal,
  closeModal,
});

const containerClass = computed(() => {
  return useRoute().path === '/referrals' ? 'container-referrals' : 'container-other';
});

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet');

.over::-webkit-scrollbar {
  display: none;
}
.z-400{
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