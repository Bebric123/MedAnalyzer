import React from 'react';
import Card from './Card';
import { deactivateDisease } from '../services/diseases';

const DiseaseCard = ({ disease, onStatusChange }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getSeverityColor = (diseaseCode) => {
    if (!diseaseCode) return '#a0aec0';
    if (diseaseCode.startsWith('I')) return '#fc8181';
    if (diseaseCode.startsWith('J')) return '#63b3ed';
    if (diseaseCode.startsWith('M')) return '#f6ad55';
    if (diseaseCode.startsWith('D')) return '#f687b3'; 
    return '#a0aec0'; 
  };

  const handleMarkAsCured = async () => {
    if (!window.confirm(`Вы уверены, что хотите отметить "${disease.disease_name}" как вылеченное?`)) {
      return;
    }

    try {
      await deactivateDisease(disease.id);
      
      alert('Заболевание отмечено как вылеченное!');
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('Ошибка при деактивации заболевания:', error);
      const errorMessage = error.response?.data?.error || 'Произошла ошибка при обновлении статуса';
      alert(`Не удалось обновить статус: ${errorMessage}`);
    }
  };

  return (
    <Card>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '0.5rem'
      }}>
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', color: '#2d3748' }}>
            {disease.disease_name}
          </h4>
          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            backgroundColor: getSeverityColor(disease.disease_code),
            color: 'white',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            {disease.disease_code || 'Без кода'}
          </div>
        </div>
        
        <div style={{
          padding: '0.25rem 0.75rem',
          backgroundColor: disease.is_active ? '#c6f6d5' : '#fed7d7',
          color: disease.is_active ? '#22543d' : '#742a2a',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {disease.is_active ? 'Активно' : 'Неактивно'}
        </div>
      </div>
      
      <div style={{ 
        fontSize: '14px', 
        color: '#718096',
        marginBottom: '0.5rem'
      }}>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>Диагностировали:</strong> {formatDate(disease.first_detected)}
        </div>
      </div>
      
      {disease.description && (
        <div style={{
          fontSize: '14px',
          color: '#4a5568',
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          {disease.description}
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem',
        marginTop: '1rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #e2e8f0'
      }}>
        <button
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            flex: 1
          }}
          onClick={() => alert(`Подробная информация о заболевании: ${disease.disease_name}`)}
        >
          Инфа
        </button>
        
        {disease.is_active && (
          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#feccd5',
              color: '#c53030',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              flex: 1,
              fontWeight: 'bold'
            }}
            onClick={handleMarkAsCured}
          >
            Прошло?
          </button>
        )}
      </div>
    </Card>
  );
};

export default DiseaseCard;