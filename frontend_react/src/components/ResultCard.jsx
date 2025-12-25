import Card from './Card';

const ResultCard = ({ result }) => {
  // Защита от отсутствующих данных
  if (!result) {
    return (
      <Card>
        <p>Данные не загружены</p>
      </Card>
    );
  }

  // Обработка условий
  const detectedConditions = Array.isArray(result.detected_conditions) 
    ? result.detected_conditions 
    : [];

  // Обработка рекомендаций (может быть строкой или массивом)
  const renderRecommendations = () => {
    const recs = result.recommendations;
    
    if (Array.isArray(recs) && recs.length > 0) {
      return (
        <ol style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
          {recs.map((item, index) => (
            <li key={index} style={{ marginBottom: '0.3rem' }}>
              {item}
            </li>
          ))}
        </ol>
      );
    }
    
    if (typeof recs === 'string' && recs.trim()) {
      return <p>{recs}</p>;
    }
    
    return <p>Рекомендации не предоставлены</p>;
  };

  return (
    <Card>
      <h3 style={{ marginBottom: '0.75rem' }}>
        Анализ файла: {result.filename || 'Неизвестный файл'}
      </h3>
      
      <p style={{ color: '#718096', fontSize: '0.9rem' }}>
        Дата: {result.created_at 
          ? new Date(result.created_at).toLocaleString('ru-RU') 
          : 'Дата не указана'}
      </p>
      
      <div style={{ marginTop: '1rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Резюме анализа:</h4>
        <p>{result.summary || 'Резюме не предоставлено'}</p>
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Выявленные состояния:</h4>
        {detectedConditions.length > 0 ? (
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
            {detectedConditions.map((cond, index) => (
              <li key={index} style={{ marginBottom: '0.3rem' }}>
                <strong>{cond.condition_name || 'Неизвестное состояние'}</strong>
                {cond.code && ` (код: ${cond.code})`}
                {cond.confidence !== undefined && ` — уверенность: ${(cond.confidence * 100).toFixed(1)}%`}
                {cond.severity && ` — серьезность: ${cond.severity}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>Состояния не обнаружены.</p>
        )}
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <h4 style={{ marginBottom: '0.5rem' }}>Рекомендации:</h4>
        {renderRecommendations()}
      </div>
      
      {result.error && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '10px', 
          background: '#fee', 
          borderRadius: '5px',
          color: '#c53030'
        }}>
          <strong>Ошибка анализа:</strong> {result.error}
        </div>
      )}
    </Card>
  );
};

export default ResultCard;