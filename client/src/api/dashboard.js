import api from './axios';
export const getGlobalStats = () => api.get('/dashboard/stats');
export const getProjectStats = (id) => api.get(`/dashboard/project/${id}`);
