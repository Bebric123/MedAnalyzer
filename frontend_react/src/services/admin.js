import api from '../services/api';

// Админка - управление промтами ИИ
export const adminApi = {
    // Промты ИИ
    getPrompts: () => api.get('/admin/prompts/'),
    getPrompt: (id) => api.get(`/admin/prompts/${id}/`),
    createPrompt: (data) => api.post('/admin/prompts/', data),
    updatePrompt: (id, data) => api.put(`/admin/prompts/${id}/`, data),
    deletePrompt: (id) => api.delete(`/admin/prompts/${id}/`),
    activatePrompt: (id) => api.post(`/admin/prompts/${id}/activate/`),
    
    // Пользователи
    getUsers: () => api.get('/admin/users/'),
    updateUser: (id, data) => api.put(`/admin/users/${id}/`, data),
    
    // Аналитика
    getStats: () => api.get('/admin/stats/'),
    getLogs: () => api.get('/admin/logs/'),
};