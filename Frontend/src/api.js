import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

export const expenseAPI = {
  addExpense: (amount, category, note) =>
    api.post('/expenses', { amount, category, note }),
  getExpenses: () => api.get('/expenses'),
  deleteExpense: (id) => api.delete(`/expenses/${id}`),
  updateExpense: (id, amount, category, note) =>
    api.put(`/expenses/${id}`, { amount, category, note }),
};

export const insightAPI = {
  getCategoryBreakdown: () => api.get('/insights/category-breakdown'),
  getTotalSpending: () => api.get('/insights/total-spending'),
  getLeakDetection: () => api.get('/insights/leak-detection'),
  getSpendingSpikes: () => api.get('/insights/spending-spikes'),
};

export const getApiErrorMessage = (err, fallback = 'Something went wrong') => {
  const data = err?.response?.data;
  if (!data) {
    return fallback;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((item) => item.msg).join(', ');
  }

  return data.message || fallback;
};

export default api;
