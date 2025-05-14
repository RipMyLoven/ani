<template>
  <div class="flex flex-col h-screen bg-gray-900 text-white">
    <!-- Header -->
    <div class="p-4 border-b border-gray-800">
      <div class="flex items-center font-bold mb-3">
        Messages <Square class="h-4 w-4 ml-1" />
      </div>
      <div class="flex gap-2">
        <div class="flex items-center bg-gray-800 rounded-full px-4 py-2 flex-grow">
          <Search class="h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search" 
            class="bg-transparent border-none text-white ml-2 w-full focus:outline-none"
          />
        </div>
        <button class="bg-gray-800 rounded-full px-4 py-2 text-white">
          Add Friend
        </button>
      </div>
    </div>

    <!-- Message List -->
    <div class="flex-grow overflow-y-auto">
      <div class="flex p-3 gap-3 border-b border-gray-800">
        <div class="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center flex-shrink-0">
          <MessageSquare class="h-5 w-5" />
        </div>
        <div class="flex-grow">
          <div class="flex justify-between mb-1">
            <span class="font-bold">RepliAgent</span>
            <span class="text-gray-400 text-sm">3m</span>
          </div>
          <div class="text-gray-400 text-sm truncate">
            Would you like me to help you with the project?
          </div>
        </div>
      </div>

      <div class="flex p-3 gap-3 border-b border-gray-800">
        <div class="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0">
          <User class="h-5 w-5" />
        </div>
        <div class="flex-grow">
          <div class="flex justify-between mb-1">
            <span class="font-bold">Nezumi</span>
            <span class="text-gray-400 text-sm">27m</span>
          </div>
          <div class="text-gray-400 text-sm truncate">
            Thanks for the help with my account!
          </div>
        </div>
      </div>

      <div class="flex p-3 gap-3 border-b border-gray-800">
        <div class="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
          <Heart class="h-5 w-5" />
        </div>
        <div class="flex-grow">
          <div class="flex justify-between mb-1">
            <span class="font-bold">NattyKit</span>
            <span class="text-gray-400 text-sm">5h</span>
          </div>
          <div class="text-gray-400 text-sm truncate">
            Check it! Send me the design when it's complete!
          </div>
        </div>
      </div>

      <div class="flex p-3 gap-3 border-b border-gray-800">
        <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <Zap class="h-5 w-5" />
        </div>
        <div class="flex-grow">
          <div class="flex justify-between mb-1">
            <span class="font-bold">RapidX</span>
            <span class="text-gray-400 text-sm">3d</span>
          </div>
          <div class="text-gray-400 text-sm truncate">
            Just got a response on my implementation of ChatGPT API
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-around py-3 border-t border-gray-800">
      <button class="flex flex-col items-center text-gray-400">
        <MessageCircle class="h-6 w-6" />
      </button>
      <button class="flex flex-col items-center text-gray-400">
        <Bell class="h-6 w-6" />
      </button>
      <button class="flex flex-col items-center text-white">
        <div class="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center mb-1">
          <User class="h-5 w-5" />
        </div>
        <span class="text-xs">You</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { Square, Search, MessageSquare, User, Heart, Zap, MessageCircle, Bell } from 'lucide-vue-next'
</script>