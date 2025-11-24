import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('leautotech_jwt') || 
                localStorage.getItem('auth-storage') && 
                JSON.parse(localStorage.getItem('auth-storage')).state?.token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem('leautotech_jwt');
      localStorage.removeItem('auth-storage');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  verify: (token) => api.post('/auth/verify', { token }),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

// Inventory endpoints
export const inventoryAPI = {
  getAll: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  updateQuantity: (id, quantity, operation) => 
    api.patch(`/inventory/${id}/quantity`, { quantity, operation }),
  getStats: () => api.get('/inventory/stats/summary'),
};

// Pallet endpoints
export const palletAPI = {
  getAll: (params) => api.get('/pallets', { params }),
  getById: (id) => api.get(`/pallets/${id}`),
  create: (data) => api.post('/pallets', data),
  update: (id, data) => api.put(`/pallets/${id}`, data),
  delete: (id) => api.delete(`/pallets/${id}`),
  assignItem: (palletId, itemId) => api.post(`/pallets/${palletId}/items/${itemId}`),
  removeItem: (palletId, itemId) => api.delete(`/pallets/${palletId}/items/${itemId}`),
};

// Shopify endpoints
export const shopifyAPI = {
  getProducts: (params) => api.get('/shopify/products', { params }),
  sync: () => api.post('/shopify/sync'),
  updateInventory: (id, quantity) => api.put(`/shopify/inventory/${id}`, { quantity }),
};

// Log endpoints
export const logAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getById: (id) => api.get(`/logs/${id}`),
  getStats: () => api.get('/logs/stats/summary'),
  cleanup: (days) => api.delete('/logs/cleanup', { params: { days } }),
};

export default api;
