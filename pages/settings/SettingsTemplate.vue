<template>
  <div class="flex flex-col items-center justify-center mt-12">
    <SettingsTop :user="user" />
    <div class="mt-12">
      <!-- Здесь можешь добавить форму настроек, если нужно -->
    </div>
    <SettingsDown :logout="logout" />
  </div>
</template>

<script setup lang="ts">
import { useSettingsLogic } from './SettingsLogic';

const {
  user,
  logout,
} = useSettingsLogic();
</script>