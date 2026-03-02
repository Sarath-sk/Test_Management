import api from './axios';
export const getTestRuns = (projectId) => api.get('/testruns', { params: { projectId } });
export const getTestRun = (id) => api.get(`/testruns/${id}`);
export const createTestRun = (d) => api.post('/testruns', d);
export const updateResult = (runId, resultId, d) => api.put(`/testruns/${runId}/results/${resultId}`, d);
export const deleteTestRun = (id) => api.delete(`/testruns/${id}`);
