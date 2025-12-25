import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const Dashboard = () => (
  <div>
    <h1 style={{ marginBottom: '1.0rem' }}>Добро пожаловать в MedAnalyzer</h1>
    
    <Card style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Быстрый доступ</h2>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/upload" style={{ textDecoration: 'none' }}>
          <Button variant="upload">Загрузить файл</Button>
        </Link>
        <Link to="/history" style={{ textDecoration: 'none' }}>
          <Button variant="secondary">Моя история болезней</Button>
        </Link>
      </div>
    </Card>

    <Card>
      <h3>Развитие медицины</h3>
      <p style={{ color: '#718096', marginTop: '0.5rem' }}>
        Современная медицина стремительно трансформируется под влиянием цифровых технологий. Искусственный интеллект уже сегодня помогает диагностировать заболевания на ранних стадиях, анализируя медицинские изображения с точностью, превышающей человеческие возможности. Телемедицина стирает географические границы, обеспечивая доступ к квалифицированной помощи в отдаленных регионах. Генетическое редактирование CRISPR открывает перспективы лечения наследственных заболеваний, а персонализированная медицина позволяет подбирать терапию с учетом индивидуальных особенностей пациента. Бионические протезы с нейроинтерфейсами возвращают утраченные функции, а нанороботы в будущем смогут доставлять лекарства точно в пораженные клетки. Однако этический контроль за инновациями остается критически важным для безопасного развития отрасли.
      </p>
    </Card>
  </div>
);

export default Dashboard;