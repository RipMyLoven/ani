import { ref, reactive } from 'vue';
import { useRouter } from '#app';
import { useAuthStore } from '~/server/stores/auth';
import type { User } from '~/server/stores/auth';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const useRegisterLogic = () => {
  const router = useRouter();
  
  const form = reactive<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const errors = reactive<FormErrors>({});
  const isLoading = ref(false);
  
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validateForm = (): boolean => {
    errors.username = '';
    errors.email = '';
    errors.password = '';
    errors.confirmPassword = '';
    
    let isValid = true;
    
    if (!form.username.trim()) {
      errors.username = 'Username is required';
      isValid = false;
    }
    
    if (!form.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(form.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    if (!form.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    return isValid;
  };
  
  const registerUser = async () => {
    try {
      isLoading.value = true;
      const response = await $fetch<{user: User, ok: boolean}>('/api/auth/register', {
        method: 'POST',
        body: {
          username: form.username,
          email: form.email,
          password: form.password
        }
      });
      
      const authStore = useAuthStore();
      if (response && response.user) {
        authStore.setUser(response.user);
        router.push('/home');
      } else {
        console.error("No user data in response");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.statusCode === 409) {
        if (error.statusMessage?.includes('Email already')) {
          errors.email = 'Email is already in use';
        } else if (error.statusMessage?.includes('Username already')) {
          errors.username = 'Username is already in use';
        } else {
          errors.username = 'User already exists';
        }
      } else {
        alert('Registration failed: ' + (error.statusMessage || 'Unknown error'));
      }
    } finally {
      isLoading.value = false;
    }
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      registerUser();
    }
  };
  
  return {
    form,
    errors,
    isLoading,
    validateForm,
    registerUser,
    handleSubmit
  };
};