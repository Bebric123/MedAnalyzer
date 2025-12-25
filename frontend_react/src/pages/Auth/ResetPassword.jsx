import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../../services/auth';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';

const ResetPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      alert('Ссылка для восстановления отправлена на ваш email');
    } catch (err) {
      alert('Не удалось отправить письмо');
    }
  };

  return (
    <Card style={{ maxWidth: '420px', margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Восстановление пароля</h2>
      <form onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Button type="submit" style={{ width: '100%' }}>Отправить ссылку</Button>
      </form>
      <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.95rem' }}>
        <Link to="/login" style={{ color: '#0056B3' }}>← Назад к входу</Link>
      </div>
    </Card>
  );
};

export default ResetPassword;