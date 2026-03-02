import api from './axios';
export const login = (d) => api.post('/auth/login', d);
export const register = (d) => api.post('/auth/register', d);
export const getMe = () => api.get('/auth/me');
export const updateMe = (d) => api.put('/auth/me', d);
export const changePassword = (d) => api.put('/auth/change-password', d);
