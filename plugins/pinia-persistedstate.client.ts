import { defineNuxtPlugin } from '#app';
import { createPersistedState } from 'pinia-plugin-persistedstate';

export default defineNuxtPlugin(({ $pinia }: any) => {
  $pinia.use(createPersistedState({
    storage: localStorage
  }));
});