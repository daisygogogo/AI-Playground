import { api } from './api';
import { LoginFormData, RegisterFormData, AuthResponse } from '../types/auth';

export const authService = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    const { user, accessToken } = response.data.data;
    return { user, token: accessToken };
  },

  async register(data: RegisterFormData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const { user, accessToken } = response.data.data;
    return { user, token: accessToken };
  },

  async getMe(): Promise<any> {
    const response = await api.get('/user/me');
    return response.data.data;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};
