import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  getDashboardStats: () => api.get('/users/dashboard-stats'),
  getAllUsers: (params = {}) => api.get('/users', { params }),
  createUser: (userData) => api.post('/users', userData),
};

// Store API
export const storeAPI = {
  getAllStores: (params = {}) => api.get('/stores', { params }),
  createStore: (storeData) => api.post('/stores', storeData),
  getMyStores: () => api.get('/stores/my-stores'),
  getStoreRatings: (storeId) => api.get(`/stores/${storeId}/ratings`),
};

// Rating API
export const ratingAPI = {
  submitRating: (ratingData) => api.post('/ratings', ratingData),
  getMyRatings: () => api.get('/ratings/my-ratings'),
};

export default api;
