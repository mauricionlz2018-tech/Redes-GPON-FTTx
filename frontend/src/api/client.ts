import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
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

