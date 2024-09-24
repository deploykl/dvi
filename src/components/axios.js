import axios from 'axios';
import router from '../router';

// Crear una instancia de axios con la URL base desde .env
const api = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL
});

// Interceptor de solicitudes para agregar el token de autenticación
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Limpiar almacenamiento local
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('is_superuser');
      localStorage.removeItem('is_staff');

      // Redirigir al login
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
