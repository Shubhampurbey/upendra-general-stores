import axios from 'axios';

/**
 * Normalizes an API base URL so that:
 * - Trailing slashes are stripped
 * - Duplicate /api segments are prevented (e.g. /api/api -> /api)
 * - The URL always ends with exactly '/api'
 */
export const normalizeApiBaseUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim().replace(/\/+$/, '');
  
  // Strip duplicate '/api' if repeated
  while (url.endsWith('/api/api')) {
    url = url.slice(0, -4);
  }
  
  // Ensure the URL ends with '/api'
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  
  return url;
};

/**
 * Determines the API base URL:
 * 1. Checks VITE_API_BASE_URL or VITE_API_URL environment variable (normalizing it to ensure '/api' suffix)
 * 2. In production (e.g. Vercel deployment), falls back to Render backend URL 'https://upendra-general-stores.onrender.com/api'
 * 3. In local development, falls back to 'http://127.0.0.1:8000/api'
 */
export const getApiBaseUrl = () => {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  const envUrl = env.VITE_API_BASE_URL || env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return normalizeApiBaseUrl(envUrl);
  }
  
  // Production fallback: ensures no localhost is used on production deployments
  if (env.PROD) {
    return 'https://upendra-general-stores.onrender.com/api';
  }
  
  // Local development default fallback
  return 'http://127.0.0.1:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Intercept requests to attach JWT access token & handle FormData
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('upendra_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      if (config.headers.common) delete config.headers.common['Content-Type'];
      if (config.headers.post) delete config.headers.post['Content-Type'];
      if (config.headers.put) delete config.headers.put['Content-Type'];
      if (config.headers.patch) delete config.headers.patch['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for token refresh or logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('upendra_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = res.data.access;
          localStorage.setItem('upendra_access_token', newAccessToken);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('upendra_access_token');
          localStorage.removeItem('upendra_refresh_token');
          localStorage.removeItem('upendra_user');
          window.location.href = '/signin';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
