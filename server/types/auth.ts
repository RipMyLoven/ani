export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  created_at?: string;
  sessionToken?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Дополнительные типы для серверной части
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}