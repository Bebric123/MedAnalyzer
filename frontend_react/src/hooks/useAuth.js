// frontend_react/src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { login as loginApi, register as registerApi } from '../services/auth';
import { getCsrfToken } from '../services/auth'; // ← импортируем

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Заглушка: в реальности — запрос /api/auth/me/
      setUser({ email: 'user@example.com', name: 'Пользователь' });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await loginApi(email, password);
    localStorage.setItem('token', 'session-auth');
    setUser(res.data.user);

    // ✅ Получаем CSRF-токен после входа
    await getCsrfToken(); // ← вызываем импортированную функцию
    return res.data;
  };

  const register = async (userData) => {
    const res = await registerApi(userData);
    localStorage.setItem('token', 'session-auth');
    setUser(res.data.user);

    // ✅ Получаем CSRF-токен после регистрации
    await getCsrfToken();
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, login, register, logout };
};