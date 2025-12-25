import api from './api';

export const getJournalEntries = () => api.get('/journal/');
export const createJournalEntry = (data) => api.post('/journal/create/', data);
export const updateJournalEntry = (id, data) => api.put(`/journal/${id}/`, data);
export const deleteJournalEntry = (id) => api.delete(`/journal/${id}/`);