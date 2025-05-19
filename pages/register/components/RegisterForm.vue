<template>
  <form @submit.prevent="handleSubmit" class="w-full max-w-sm">
    <div class="mb-4">
      <label for="username" class="block text-gray-400 text-sm mb-1">Username</label>
      <input 
        type="text" 
        id="username" 
        v-model="form.username" 
        class="w-full bg-[#333333] text-white px-3 py-2 rounded-md focus:outline-none"
        :class="{'border border-red-500': errors.username}"
      />
      <p v-if="errors.username" class="text-red-500 text-xs mt-1">{{ errors.username }}</p>
    </div>
    
    <div class="mb-4">
      <label for="email" class="block text-gray-400 text-sm mb-1">Email</label>
      <input 
        type="email" 
        id="email" 
        v-model="form.email" 
        class="w-full bg-[#333333] text-white px-3 py-2 rounded-md focus:outline-none"
        :class="{'border border-red-500': errors.email}"
      />
      <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
    </div>
    
    <div class="mb-4">
      <label for="password" class="block text-gray-400 text-sm mb-1">Password</label>
      <input 
        type="password" 
        id="password" 
        v-model="form.password" 
        class="w-full bg-[#333333] text-white px-3 py-2 rounded-md focus:outline-none"
        :class="{'border border-red-500': errors.password}"
      />
      <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
    </div>
    
    <div class="mb-6">
      <label for="confirmPassword" class="block text-gray-400 text-sm mb-1">Confirm password</label>
      <input 
        type="password" 
        id="confirmPassword" 
        v-model="form.confirmPassword" 
        class="w-full bg-[#333333] text-white px-3 py-2 rounded-md focus:outline-none"
        :class="{'border border-red-500': errors.confirmPassword}"
      />
      <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
    </div>
    
    <button 
      type="submit" 
      class="w-full bg-[#222222] text-white py-3 rounded-md hover:bg-[#2a2a2a] transition-colors"
      :disabled="isLoading"
    >
      {{ isLoading ? 'Registering...' : 'Register' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { useRegisterLogic } from '../registerLogic';

const { form, errors, handleSubmit, isLoading } = useRegisterLogic();
</script>

<style scoped>
input {
  border: none;
}
</style>