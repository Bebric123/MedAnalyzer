import api from './api';

// Экспортируем отдельные функции, а не объект
export const register = (userData) => api.post('/auth/register/', userData);
export const login = (email, password) => api.post('/auth/login/', { email, password });
export const logout = (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken });
export const getProfile = () => api.get('/auth/profile/');
export const changePassword = (data) => api.post('/auth/password/change/', data);
export const resetPassword = (email) => api.post('/auth/password/reset/', { email });
export const getCsrfToken = () => api.get('/auth/csrf/');