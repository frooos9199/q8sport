import axios from 'axios';
import API_CONFIG from '../config/api';
import { StorageService } from '../utils/storage';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await StorageService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Provide a user-friendly message for screens that display `error.message`
      if (axios.isAxiosError(error)) {
        error.message = 'يرجى تسجيل الدخول';
      }
      await StorageService.clearAll();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
