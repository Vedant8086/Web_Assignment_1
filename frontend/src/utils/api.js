import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config?.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  createUser: (userData) => api.post('/users', userData),
  updateProfile: (userData) => {
    console.log('🔧 API: Updating profile with data:', userData);
    return api.patch('/users/profile', userData);
  },
  getDashboardStats: () => api.get('/users/dashboard-stats'),
};

// Admin API
export const adminAPI = {
  updateUser: (userId, userData) => api.patch(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  updateStore: (storeId, storeData) => api.patch(`/admin/stores/${storeId}`, storeData),
  deleteStore: (storeId) => api.delete(`/admin/stores/${storeId}`),
};

// Store API
export const storeAPI = {
  getAllStores: (params) => api.get('/stores', { params }),
  createStore: (storeData) => api.post('/stores', storeData),
  createOwnStore: (storeData) => api.post('/stores/create-own', storeData),
  getMyStores: () => api.get('/stores/my-stores'),
  getStoreRatings: (storeId) => api.get(`/stores/${storeId}/ratings`),
  updateStoreByOwner: (storeId, storeData) => api.patch(`/stores/${storeId}/update`, storeData),
};

// FIXED: Rating API with proper error handling
export const ratingAPI = {
  submitRating: (ratingData) => {
    console.log('🌟 API: Submitting rating:', ratingData);
    return api.post('/ratings', ratingData);
  },
  getUserRatings: () => {
    console.log('📊 API: Fetching user ratings');
    return api.get('/ratings/my-ratings');
  },
  getAllRatings: () => api.get('/ratings'),
  deleteRating: (ratingId) => {
    console.log('🗑️ API: Deleting rating:', ratingId);
    return api.delete(`/ratings/${ratingId}`);
  },
};

export default api;
