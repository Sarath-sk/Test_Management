import api from './axios';
export const getProjects = () => api.get('/projects');
export const getProject = (id) => api.get(`/projects/${id}`);
export const createProject = (d) => api.post('/projects', d);
export const updateProject = (id, d) => api.put(`/projects/${id}`, d);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const addMember = (id, d) => api.post(`/projects/${id}/members`, d);
export const removeMember = (id, userId) => api.delete(`/projects/${id}/members/${userId}`);
