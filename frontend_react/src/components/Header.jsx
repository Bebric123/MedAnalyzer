import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header style={{
      backgroundColor: '#4778b5ff',
      color: 'white',
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.3rem' }}>MedAnalyzer</Link>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/journal" style={{ color: 'white' }}>Дневник самочувствия</Link>
          <button
            onClick={handleLogout}
            style={{ color: 'white', background: 'none', fontSize: '0.95rem' }}
          >
            Выйти
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;