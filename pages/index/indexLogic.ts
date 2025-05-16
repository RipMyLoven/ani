// indexLogic.ts
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useIndexLogic = () => {
  const whiteListeds = ref<boolean>(true);
  const isLoading = ref<boolean>(false);
  const router = useRouter();

  return {
    whiteListeds,
    isLoading,
  };
};
