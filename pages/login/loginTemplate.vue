<template>
  <div class="flex flex-col items-center justify-center mt-12">
    <LoginAvatar />
<div class="mt-12">

</div>
    <LoginForm />
  </div>
</template>

<script setup lang="ts">
import { useLoginLogic } from './loginLogic';

const loginLogic = useLoginLogic();
</script>