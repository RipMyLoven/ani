<template>
  <div class="flex flex-row items-center bg-[#222222] p-2 sm:p-3 w-full gap-2">
    <div class="relative flex-1 w-full">
      <div class="absolute left-3 top-1/2 transform -translate-y-1/2">
        <img src="~/public/assets/icons/search.svg" alt="Search" class="w-5 h-5">
      </div>
      
      <input 
        type="text" 
        placeholder="Search" 
        class="w-full h-12 bg-[#333333] border-none rounded px-10 text-white placeholder-gray-400"
      />
    </div>
    
    <button class="h-12 bg-[#333333] border-none rounded px-3 sm:px-4 text-white hover:bg-[#444444] text-xs sm:text-sm whitespace-nowrap">
      Add Friend
    </button>
  </div>
</template>

<script>
export default {
  name: 'SearchBar'
}
</script>