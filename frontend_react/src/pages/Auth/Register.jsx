import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../services/auth';  // Изменено здесь
import FormErrorDisplay from '../../components/FormErrorDisplay';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password2: '',
        full_name: '',
        date_of_birth: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Очищаем ошибку при изменении поля
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
        setSuccessMessage('');
        setLoading(true);

        try {
            const response = await register(formData);  // Изменено здесь
            
            if (response.data.success) {
                setSuccessMessage('Регистрация успешна! Вы будете перенаправлены на страницу входа...');
                
                // Сохраняем токены
                localStorage.setItem('token', response.data.data.tokens.access);
                localStorage.setItem('refreshToken', response.data.data.tokens.refresh);
                
                // Перенаправляем через 2 секунды
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const apiErrors = error.response.data;
                
                if (apiErrors.errors) {
                    setErrors(apiErrors.errors);
                } else if (apiErrors.message) {
                    setErrors({ general: [apiErrors.message] });
                }
                
                // Показываем общую ошибку
                if (apiErrors.message && !apiErrors.errors) {
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
                Регистрация в MedAnalyzer
            </h2>

            {successMessage && (
                <div style={{
                    padding: '15px',
                    background: '#d4edda',
                    color: '#155724',
                    borderRadius: '5px',
                    marginBottom: '20px',
                    border: '1px solid #c3e6cb'
                }}>
                    ✅ {successMessage}
                </div>
            )}

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
                        Email *
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
                            fontSize: '16px',
                            transition: 'border 0.3s'
                        }}
                        placeholder="example@mail.com"
                        disabled={loading}
                    />
                    <FormErrorDisplay errors={errors} fieldName="email" />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#555'
                    }}>
                        ФИО *
                    </label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: errors.full_name ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }}
                        placeholder="Иванов Иван Иванович"
                        disabled={loading}
                    />
                    <FormErrorDisplay errors={errors} fieldName="full_name" />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#555'
                    }}>
                        Дата рождения (опционально)
                    </label>
                    <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: errors.date_of_birth ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }}
                        disabled={loading}
                    />
                    <FormErrorDisplay errors={errors} fieldName="date_of_birth" />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#555'
                    }}>
                        Пароль *
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
                        placeholder="Не менее 8 символов"
                        disabled={loading}
                    />
                    <FormErrorDisplay errors={errors} fieldName="password" />
                    <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                        Должен содержать: буквы, цифры, минимум 8 символов
                    </small>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#555'
                    }}>
                        Подтверждение пароля *
                    </label>
                    <input
                        type="password"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: errors.password2 ? '2px solid #dc3545' : '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '16px'
                        }}
                        placeholder="Повторите пароль"
                        disabled={loading}
                    />
                    <FormErrorDisplay errors={errors} fieldName="password2" />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '15px',
                        background: loading ? '#6c757d' : '#124c8aff',
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
                            Регистрация...
                        </>
                    ) : 'Зарегистрироваться'}
                </button>

                <div style={{ textAlign: 'center', color: '#666' }}>
                    Уже есть аккаунт?{' '}
                    <Link 
                        to="/login" 
                        style={{
                            color: '#007bff',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                    >
                        Войти
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Register;