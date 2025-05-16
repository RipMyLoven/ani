import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

interface LoginForm {
  usernameOrEmail: string;
  password: string;
}

interface FormErrors {
  usernameOrEmail?: string;
  password?: string;
}

export const useLoginLogic = () => {
  const router = useRouter();
  
  const form = reactive<LoginForm>({
    usernameOrEmail: '',
    password: '',
  });
  
  const errors = reactive<FormErrors>({});
  const isLoading = ref(false);
  
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const validateForm = (): boolean => {
    errors.usernameOrEmail = '';
    errors.password = '';
    
    let isValid = true;
    
    if (!form.usernameOrEmail.trim()) {
      errors.usernameOrEmail = 'Username or Email is required';
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
      
      // Determine if input is email or username
      const isEmail = validateEmail(form.usernameOrEmail);
      
      // Here you would make your API call to login the user
      // For example:
      // const response = await $fetch('/api/login', {
      //   method: 'POST',
      //   body: {
      //     [isEmail ? 'email' : 'username']: form.usernameOrEmail,
      //     password: form.password
      //   }
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to home after successful login
      router.push('/home');
    } catch (error) {
      console.error('Login error:', error);
      // Handle specific API errors here
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