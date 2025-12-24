/**
 * API Layer - Centralized HTTP Client Configuration
 * 
 * Architecture: Axios instance with interceptors
 * - Request interceptor: Automatically attaches JWT token to all requests
 * - Response interceptor: Handles 401 (unauthorized) globally, redirects to login
 * - Grouped API endpoints by resource (auth, posts, comments, tags)
 * - Type-safe parameter interfaces for better IDE support
 * 
 * @author Omar Tarek
 */

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

// Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const STORAGE_KEY = 'token';

// ─────────────────────────────────────────────────────────────
// Axios Instance
// ─────────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─────────────────────────────────────────────────────────────
// Helper: Multipart config
// ─────────────────────────────────────────────────────────────
const multipart: AxiosRequestConfig = {
  headers: { 'Content-Type': 'multipart/form-data' },
};

// ─────────────────────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: FormData) => api.post('/register', data, multipart),
  login: (email: string, password: string) => api.post('/login', { email, password }),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  updateProfile: (data: FormData) => api.post('/profile', data, { ...multipart, params: { _method: 'PUT' } }),
};

// ─────────────────────────────────────────────────────────────
// Posts API
// ─────────────────────────────────────────────────────────────
interface PostListParams {
  page?: number;
  search?: string;
  tag?: string;
}

export const postsApi = {
  list: (params?: PostListParams) => api.get('/posts', { params }),
  get: (id: number) => api.get(`/posts/${id}`),
  create: (data: FormData) => api.post('/posts', data, multipart),
  update: (id: number, data: FormData) =>
    api.post(`/posts/${id}`, data, { ...multipart, params: { _method: 'PUT' } }),
  delete: (id: number) => api.delete(`/posts/${id}`),
  toggleLike: (id: number) => api.post(`/posts/${id}/like`),
};

// ─────────────────────────────────────────────────────────────
// Comments API
// ─────────────────────────────────────────────────────────────
export const commentsApi = {
  list: (postId: number) => api.get(`/posts/${postId}/comments`),
  create: (postId: number, body: string) => api.post(`/posts/${postId}/comments`, { body }),
  update: (id: number, body: string) => api.put(`/comments/${id}`, { body }),
  delete: (id: number) => api.delete(`/comments/${id}`),
};

// ─────────────────────────────────────────────────────────────
// Tags API
// ─────────────────────────────────────────────────────────────
export const tagsApi = {
  list: (search?: string) => api.get('/tags', { params: { search } }),
  create: (name: string) => api.post('/tags', { name }),
  delete: (id: number) => api.delete(`/tags/${id}`),
};
