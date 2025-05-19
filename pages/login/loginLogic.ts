import { ref, reactive } from 'vue';
import { useRouter } from '#app';
import { useAuthStore } from '~/server/stores/auth';
import type { User } from '~/server/stores/auth';

interface LoginForm {
  username: string;
  password: string;
}

interface FormErrors {
  username?: string;
  password?: string;
}

export const useLoginLogic = () => {
  const router = useRouter();
  
  const form = reactive<LoginForm>({
    username: '',
    password: '',
  });
  
  const errors = reactive<FormErrors>({});
  const isLoading = ref(false);
  
  const validateForm = (): boolean => {
    errors.username = '';
    errors.password = '';
    
    let isValid = true;
    
    if (!form.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }
    
    if (!form.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    return isValid;
  };
  
  const loginUser = async () => {
    try {
      isLoading.value = true;
      console.log("Attempting login...");
      
      const response = await $fetch<{user: User, ok: boolean}>('/api/auth/login', {
        method: 'POST',
        body: {
          username: form.username,
          password: form.password
        }
      });
      
      const authStore = useAuthStore();
      if (response && response.user) {
        authStore.setUser(response.user);
        
        window.location.href = '/home'; 
      }
    } catch (error: any) {
      if (error.statusCode === 401) {
        errors.username = 'Invalid username or password';
      } else {
        console.error('Login error:', error);
      }
    } finally {
      isLoading.value = false;
    }
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      loginUser();
    }
  };
  
  return {
    form,
    errors,
    isLoading,
    validateForm,
    loginUser,
    handleSubmit
  };
};