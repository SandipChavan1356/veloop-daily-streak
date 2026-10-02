import api from './api';

export const register = (payload) => api.post('/auth/register', payload).then((r) => r.data);
export const login = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const me = () => api.get('/auth/me').then((r) => r.data);
