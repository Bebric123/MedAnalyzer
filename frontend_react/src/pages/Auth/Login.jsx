import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../services/auth';  // Изменено здесь
import FormErrorDisplay from '../../components/FormErrorDisplay';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const response = await login(formData.email, formData.password);  // Изменено здесь
            
            if (response.data.success) {
                // Сохраняем токены
                const { access, refresh } = response.data.data.tokens;
                localStorage.setItem('token', access);
                if (rememberMe) {
                    localStorage.setItem('refreshToken', refresh);
                } else {
                    sessionStorage.setItem('refreshToken', refresh);
                }
                
                // Сохраняем данные пользователя
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                
                // Перенаправляем на главную
                navigate('/');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const apiErrors = error.response.data;
                
                if (apiErrors.errors) {
                    setErrors(apiErrors.errors);
                } else if (apiErrors.message) {
                    setErrors({ general: [apiErrors.message] });
                }
            } else {
                setErrors({ general: ['Ошибка соединения с сервером'] });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: '500px',
            margin: '50px auto',
            padding: '30px',
            background: 'white',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
                Вход в MedAnalyzer
            </h2>

            {errors.general && (
                <div style={{
                    padding: '15px',
                    background: '#f8d7da',
                    color: '#721c24',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    border: '1px solid #f5c6cb'
                }}>
                    ❌ {errors.general[0]}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#555'
                    }}>
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: errors.email ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }}
                        placeholder="example@mail.com"
                        disabled={loading}
                    />
                    <FormErrorDisplay errors={errors} fieldName="email" />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#555'
                    }}>
                        Пароль
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: errors.password ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }}
                        placeholder="Ваш пароль"
                        disabled={loading}
                    />
                    <FormErrorDisplay errors={errors} fieldName="password" />
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px'
                }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ marginRight: '8px' }}
                            disabled={loading}
                        />
                        <span style={{ color: '#666' }}>Запомнить меня</span>
                    </label>

                    <Link 
                        to="/reset-password"
                        style={{
                            color: '#007bff',
                            textDecoration: 'none',
                            fontSize: '14px'
                        }}
                    >
                        Забыли пароль?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: loading ? '#6c757d' : '#2865a7ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background 0.3s',
                        marginBottom: '20px'
                    }}
                >
                    {loading ? (
                        <>
                            <span style={{ marginRight: '10px' }}>⏳</span>
                            Вход...
                        </>
                    ) : 'Войти'}
                </button>

                <div style={{ textAlign: 'center', color: '#666' }}>
                    Нет аккаунта?{' '}
                    <Link 
                        to="/register" 
                        style={{
                            color: '#3f6793ff',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                    >
                        Зарегистрироваться
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;