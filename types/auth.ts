export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

