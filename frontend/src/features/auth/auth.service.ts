import { api } from '@/lib/api';
import type { User } from '@/types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'CUSTOMER' | 'DRIVER';
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/login', data);
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    return api.post<LoginResponse>('/auth/register', data);
  },

  async me(): Promise<User> {
    return api.get<User>('/auth/me');
  },

  async logout(): Promise<void> {
    return api.post<void>('/auth/logout');
  },
};
