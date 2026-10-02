import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('veloop_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize every backend error into { message, code, status, data }
// so components never have to reach into axios internals.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      const { data, status } = error.response;
      if (status === 401) window.dispatchEvent(new Event('veloop:unauthorized'));
      return Promise.reject({
        message: data?.message || 'Something went wrong. Please try again.',
        code: data?.code || 'UNKNOWN',
        status,
        data,
      });
    }
    if (error.request) {
      return Promise.reject({ message: 'Cannot reach the server. Check your connection.', code: 'NETWORK_ERROR' });
    }
    return Promise.reject({ message: error.message, code: 'CLIENT_ERROR' });
  }
);

export default api;
