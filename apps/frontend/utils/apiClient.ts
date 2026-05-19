import axios, { AxiosInstance } from 'axios';
import { safeClientLogError } from '@/utils/safeClientLogger';

// Create an axios instance for direct backend API calls
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is set for all requests
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common error cases
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle server errors
    if (error.response?.status === 500) {
      safeClientLogError('api_server_error', error);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
