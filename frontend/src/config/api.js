import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Bundle endpoints
export const bundleAPI = {
  getAll: (params) => api.get('/bundles', { params }),
  getByNetwork: (network) => api.get(`/bundles/network/${network}`),
  getById: (id) => api.get(`/bundles/${id}`),
};

// Transaction endpoints
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getStats: () => api.get('/transactions/stats'),
  getById: (id) => api.get(`/transactions/${id}`),
  getByRef: (ref) => api.get(`/transactions/ref/${ref}`),
};

// Payment endpoints
export const paymentAPI = {
  initialize: (data) => api.post('/payments/initialize', data),
  verify: (reference) => api.get(`/payments/verify/${reference}`),
  walletTopup: (amount) => api.post('/payments/wallet/topup', { amount }),
  verifyWalletTopup: (reference) => api.get(`/payments/wallet/verify/${reference}`),
};

// Wallet endpoints
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
  purchase: (data) => api.post('/wallet/purchase', data),
};

// User endpoints
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  getBeneficiaries: () => api.get('/users/beneficiaries'),
  addBeneficiary: (data) => api.post('/users/beneficiaries', data),
  removeBeneficiary: (phone) => api.delete(`/users/beneficiaries/${phone}`),
  getReferrals: () => api.get('/users/referrals'),
};

// Admin endpoints
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  retryTransaction: (id) => api.post(`/admin/transactions/${id}/retry`),
  refundTransaction: (id, reason) => api.post(`/admin/transactions/${id}/refund`, { reason }),
  getAllBundles: () => api.get('/admin/bundles/all'),
  createBundle: (data) => api.post('/bundles', data),
  updateBundle: (id, data) => api.put(`/bundles/${id}`, data),
  deleteBundle: (id) => api.delete(`/bundles/${id}`),
  seedBundles: () => api.post('/bundles/seed'),
  getRevenueReport: (params) => api.get('/admin/reports/revenue', { params }),
  createAdmin: (data) => api.post('/admin/create-admin', data),
};

export default api;
