import api from './axios';
export const getUsers = () => api.get('/users');
export const createUser = (d) => api.post('/users', d);
export const updateUser = (id, d) => api.put(`/users/${id}`, d);
export const deleteUser = (id) => api.delete(`/users/${id}`);
