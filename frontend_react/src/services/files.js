import api from './api';

export const uploadFile = (file, description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) {
        formData.append('description', description);
    }
    
    return api.post('/analysis/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const getFiles = () => api.get('/files/');
export const getFile = (id) => api.get(`/files/${id}/`);
export const deleteFile = (id) => api.delete(`/files/${id}/`);
export const getFileStats = () => api.get('/files/stats/');

// Получение файла по ID сессии анализа
export const getFileByAnalysisSession = (sessionId) => api.get(`/analysis/session/${sessionId}/file/`);