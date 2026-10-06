import axios from 'axios';

// En desarrollo local usa el proxy de Vite ('/api/v1').
// En producción (Vercel) apunta directamente a tu API en Render:
const defaultApiUrl = import.meta.env.DEV
  ? ''
  : 'https://redes-gpon-fttx.onrender.com';

const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;
const baseUrl = apiUrl ? `${apiUrl.replace(/\/+$/, '')}/api/v1` : '/api/v1';

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 35000
});

// Interceptor para inyectar token JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gpon_token') || 'demo-jwt-token';
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta para capturar expiración de sesión
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Si la petición es hacia /auth/login o /auth/register, rechazar directamente el error para notificar al usuario
    if (originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('gpon_token');
    }
    return Promise.reject(error);
  }
);

export default api;


