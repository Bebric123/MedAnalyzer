import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor для добавления токена
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor для обработки ошибок
api.interceptors.response.use(
    (response) => {
        // Можно добавить логирование успешных запросов
        return response;
    },
    (error) => {
        if (error.response) {
            // Ошибка от сервера
            const { status, data } = error.response;
            
            if (status === 401) {
                // Не авторизован - редирект на логин
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else if (status === 400) {
                // Ошибка валидации - передаем дальше для обработки в компонентах
                return Promise.reject(error);
            } else if (status === 403) {
                // Доступ запрещен
                error.message = 'Доступ запрещен';
            } else if (status === 404) {
                // Ресурс не найден
                error.message = 'Ресурс не найден';
            } else if (status >= 500) {
                // Ошибка сервера
                error.message = 'Ошибка сервера. Попробуйте позже';
            }
        } else if (error.request) {
            // Запрос был сделан, но ответа нет
            error.message = 'Ошибка соединения с сервером';
        } else {
            // Что-то пошло не так при настройке запроса
            error.message = 'Ошибка при выполнении запроса';
        }
        
        return Promise.reject(error);
    }
);

export default api;