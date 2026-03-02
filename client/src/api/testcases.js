import api from './axios';
export const getTestCases = (p) => api.get('/testcases', { params: p });
export const getTestCase = (id) => api.get(`/testcases/${id}`);
export const createTestCase = (d) => api.post('/testcases', d);
export const updateTestCase = (id, d) => api.put(`/testcases/${id}`, d);
export const deleteTestCase = (id) => api.delete(`/testcases/${id}`);
export const bulkDelete = (ids) => api.post('/testcases/bulk-delete', { ids });
