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
  timeout: 15000
});

// Interceptor para inyectar token JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gpon_token') || 'demo-jwt-token';
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta para capturar expiración de sesión y auto-recuperar con token maestro
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('Sesión expirada o token no válido. Recuperando sesión maestra...');
      localStorage.removeItem('gpon_token');
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = 'Bearer demo-jwt-token';
      }
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;


