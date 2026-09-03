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
  }
});

// Interceptor para inyectar token JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gpon_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta para capturar expiración de sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token inválido o expirado
      console.warn('Sesión expirada o token no válido');
    }
    return Promise.reject(error);
  }
);

export default api;

