const BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('store_rate_token');
export const setAuthToken = (token) => localStorage.setItem('store_rate_token', token);
export const removeAuthToken = () => localStorage.removeItem('store_rate_token');

export const getStoredUser = () => {
  const user = localStorage.getItem('store_rate_user');
  return user ? JSON.parse(user) : null;
};
export const setStoredUser = (user) => localStorage.setItem('store_rate_user', JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem('store_rate_user');

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      // Token expired or invalid
      removeAuthToken();
      removeStoredUser();
      window.dispatchEvent(new Event('auth:logout'));
    }
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData) => request('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  changePassword: (passwords) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(passwords) }),

  // Stores
  getStores: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/stores${query ? `?${query}` : ''}`);
  },
  createStore: (storeData) => request('/stores', { method: 'POST', body: JSON.stringify(storeData) }),

  // Ratings
  submitRating: (data) => request('/ratings', { method: 'POST', body: JSON.stringify(data) }),
  modifyRating: (data) => request('/ratings', { method: 'PUT', body: JSON.stringify(data) }),

  // Users (Admin)
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ''}`);
  },
  createUser: (userData) => request('/users', { method: 'POST', body: JSON.stringify(userData) }),
  getUserDetails: (id) => request(`/users/${id}`),

  // Dashboards
  getAdminDashboard: () => request('/dashboard/admin'),
  getAdminStores: () => request('/stores'),
  getOwnerStore: () => request('/dashboard/store-owner'),
};
