import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchSessions = async (page = 1, pageSize = 20) => {
  const { data } = await api.get(`/playground/sessions`, { params: { page, pageSize } });
  if (Array.isArray((data as any).items)) return data;
  if (Array.isArray((data as any).sessions)) return { items: data.sessions, total: data.sessions.length, page, pageSize };
  return { items: [], total: 0, page, pageSize };
};

export const fetchSessionDetail = async (id: string) => {
  const { data } = await api.get(`/playground/sessions/${id}`);
  return data;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);