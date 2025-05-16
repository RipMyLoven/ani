<template>
  <div class="relative h-screen">
    <div class="flex items-center justify-center h-full p-4 relative z-10">
      <div class="w-full max-w-md p-4 rounded-lg flex flex-col items-center justify-center">
        <img src="/public/assets/icons/logo.svg" alt="AniMessanger Logo" class="w-36 mb-6 glow-effect">
        <p class="text-white text-center text-2xl">Welcome to AniMessanger!</p>
        <p class="text-white text-center text-xs px-6 p-2">This is a place where you can find new friends and be unique.</p>

        <div class="flex flex-col mt-4">
          <NuxtLink v-if="whiteListed == true" to="/register">
            <button
              class="py-3 px-6 text-white rounded-lg block mx-auto w-full text-xl font-bold 
                     bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                     hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 
                     transition-all duration-300 transform hover:scale-105 
                     shadow-lg hover:shadow-xl high-priority-element">
              Begin your journey!
            </button>
          </NuxtLink>
        </div>

        <div class="absolute bottom-5">
          <p class="text-white text-center text-sm px-10 p-2">
            Not on the whitelist? Don't worry, ask for the invitation link <span class="underline">here</span>❤️
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  whiteListed: {
    type: Boolean,
    required: false,
    default: false
  }
});
</script>

<style scoped>
.high-priority-element {
  position: relative;
  z-index: 200;
}
.glow-on-hover {
    outline: none;
    cursor: pointer;
    position: relative;
    z-index: 0;
    overflow: hidden;
}


.glow-on-hover:before {
    content: '';
    background: linear-gradient(-45deg , #FFFFFF, #DCDCDC, #C0C0C0, #808080, #C0C0C0, #DCDCDC, #FFFFFF);
    position: absolute;
    top: 0px;
    left: 0px;
    background-size: 400%;
    z-index: -1;
    filter: blur(5px);
    width: calc(100%);
    height: calc(100%);
    animation: glowing 30s linear infinite;
    opacity: 1; /* Всегда активный эффект */
}

.glow-on-hover:after {
    z-index: -1;
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    border-radius: 10px;
}

@keyframes glowing {
    0% { background-position: 0 0; }
    50% { background-position: 400% 0; }
    100% { background-position: 0 0; }
}

.glow-effect {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
}
</style>