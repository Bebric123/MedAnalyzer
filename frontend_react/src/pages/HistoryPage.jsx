import React from 'react';
import WarningBanner from '../components/WarningBanner';
import DiseaseCard from '../components/DiseaseCard';
import { useDiseases } from '../hooks/useDiseases';
import Card from '../components/Card';
import Button from '../components/Button';
import { useCallback } from 'react'

const HistoryPage = () => {
  const { diseases, loading, error } = useDiseases();
  const fetchDiseases = useCallback(async()=>{
            window.location.reload()
  }, []);
  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        marginTop: '3rem',
        padding: '2rem'
      }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p style={{ color: '#666' }}>Загрузка истории болезней...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div style={{
          padding: '20px',
          background: '#fff5f5',
          border: '1px solid #fed7d7',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#c53030', marginTop: 0 }}>⚠️ Ошибка</h3>
          <p>{error}</p>
          <p style={{ fontSize: '14px', color: '#718096' }}>
            Отображаются тестовые данные для демонстрации
          </p>
        </div>
      </Card>
    );
  }

  const activeDiseases = diseases.filter(d => d.is_active);
  const inactiveDiseases = diseases.filter(d => !d.is_active);

  

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ margin: 0 }}>Моя история болезней</h2>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Обновить
        </Button>
      </div>
      
      <WarningBanner />
      
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          marginBottom: '1rem', 
          color: '#2d3748',
          borderBottom: '2px solid #4299e1',
          paddingBottom: '0.5rem'
        }}>
          Активные состояния ({activeDiseases.length})
        </h3>
        
        {activeDiseases.length === 0 ? (
          <Card>
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#718096'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🎉</div>
              <p style={{ fontSize: '18px', marginBottom: '0.5rem' }}>
                Отличные новости!
              </p>
              <p>У вас нет активных заболеваний в истории.</p>
            </div>
          </Card>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {activeDiseases.map(disease => (
              <DiseaseCard 
                key={disease.id} 
                disease={disease} 
                onStatusChange={() => fetchDiseases()} 
              />
            ))}
          </div>
        )}
      </div>
      
      {inactiveDiseases.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ 
            marginBottom: '1rem', 
            color: '#2d3748',
            borderBottom: '2px solid #a0aec0',
            paddingBottom: '0.5rem'
          }}>
            Перенесенные заболевания ({inactiveDiseases.length})
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {inactiveDiseases.map(disease => (
              <DiseaseCard key={disease.id} disease={disease} />
            ))}
          </div>
        </div>
      )}
      
      <Card style={{ marginTop: '2rem' }}>
        <h4 style={{ marginTop: 0, color: '#4a5568' }}>Статистика</h4>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e14242ff' }}>
              {diseases.length}
            </div>
            <div style={{ fontSize: '14px', color: '#718096' }}>Всего записей</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#bb4848ff' }}>
              {activeDiseases.length}
            </div>
            <div style={{ fontSize: '14px', color: '#718096' }}>Активных</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a0aec0' }}>
              {inactiveDiseases.length}
            </div>
            <div style={{ fontSize: '14px', color: '#718096' }}>Перенесенных</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HistoryPage;