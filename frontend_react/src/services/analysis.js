import api from './api';

// Получение результата анализа по ID файла
export const getAnalysisResult = (fileId) => api.get(`/analysis/file/${fileId}/`);

// Проверка статуса анализа по ID сессии
export const checkAnalysisStatus = (sessionId) => api.get(`/analysis/session/${sessionId}/`);

// Повторный запуск анализа
export const retryAnalysis = (fileId) => api.post(`/analysis/retry/${fileId}/`);

// История анализов пользователя
export const getAnalysisHistory = () => api.get('/analysis/history/');

// Получение результата анализа по ID сессии (если нужно)
export const getResultBySessionId = (sessionId) => api.get(`/analysis/session/${sessionId}/result/`);