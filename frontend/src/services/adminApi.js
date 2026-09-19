import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nutricanteen_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

// Generic response wrapper
api.interceptors.response.use(
  (response) => {
    return response.data; // Usually { success, data, message }
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, auto logout
      localStorage.removeItem('nutricanteen_token');
      localStorage.removeItem('nutricanteen_admin_v2');
      localStorage.removeItem('nutricanteen_student_v2');
      // Dispatch custom event instead of reload to let React handle it gracefully
      window.dispatchEvent(new Event('auth:expired'));
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }
    
    // Return custom error format
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
