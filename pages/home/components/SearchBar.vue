<template>
  <div class="flex items-center bg-[#222222] p-3 w-full">
    <!-- Search Icon -->
    <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white mr-3">
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8" stroke="white" stroke-width="2" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="white" stroke-width="2" />
      </svg>
    </div>
    
    <!-- Search Input -->
    <input 
      type="text" 
      placeholder="Search" 
      class="flex-1 h-10 bg-[#333333] border-none rounded px-4 mr-3 text-white placeholder-gray-400"
    />
    
    <!-- Add Friend Button -->
    <button class="h-10 bg-[#333333] border-none rounded px-5 text-white hover:bg-[#444444]">
      Add Freind
    </button>
  </div>
</template>

<script>

</script>