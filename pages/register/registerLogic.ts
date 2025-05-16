import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

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
      
      // Here you would make your API call to register the user
      // For example:
      // const response = await $fetch('/api/register', {
      //   method: 'POST',
      //   body: {
      //     username: form.username,
      //     email: form.email,
      //     password: form.password
      //   }
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to login or dashboard
      router.push('/home');
    } catch (error) {
      console.error('Registration error:', error);
      // Handle specific API errors here
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