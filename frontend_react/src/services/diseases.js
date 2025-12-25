import api from './api';

// Получение истории заболеваний пользователя
export const getUserDiseaseHistory = () => api.get('/diseases/');

// Получение конкретного заболевания по ID
export const getDisease = (id) => api.get(`/diseases/${id}/`);

// Обновление заболевания
export const updateDisease = (id, data) => api.put(`/diseases/${id}/`, data);

// Деактивация заболевания (отметить как неактивное)
export const deactivateDisease = (id) => api.post(`/diseases/${id}/deactivate/`);