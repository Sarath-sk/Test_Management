import api from './axios';
export const getSuites = (projectId) => api.get('/suites', { params: { projectId } });
export const createSuite = (d) => api.post('/suites', d);
export const updateSuite = (id, d) => api.put(`/suites/${id}`, d);
export const deleteSuite = (id) => api.delete(`/suites/${id}`);
