import axios from 'axios';

const getDefaultApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://smartvault-gkgv.onrender.com';
  }

  return 'http://localhost:5000';
};

const rawBaseUrl = import.meta.env.VITE_API_URL || getDefaultApiUrl();
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const baseUrlWithApi = normalizedBaseUrl.endsWith('/api')
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

const api = axios.create({
  baseURL: baseUrlWithApi,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const token = JSON.parse(userInfo).token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
