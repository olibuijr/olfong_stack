import axios from 'axios';
import toast from 'react-hot-toast';

// Use external IP as default for mobile/network access
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.8.62:5000/api';

console.log('[API] API_BASE_URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Return the actual data from the nested response structure
    // If the response has a nested data structure, return it, otherwise return the full response
    if (response.data && response.data.data) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Don't show toast for auth errors (handled in components) or 404 errors (routes not implemented yet)
    if (error.response?.status !== 401 && error.response?.status !== 404) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

