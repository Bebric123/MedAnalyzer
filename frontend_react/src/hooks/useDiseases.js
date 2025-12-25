import { useState, useEffect } from 'react';
import { getUserDiseaseHistory } from '../services/diseases';

export const useDiseases = () => {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getUserDiseaseHistory();
        console.log('Ответ от API заболеваний:', response.data); // Для отладки
        
        // Проверяем разные форматы ответа
        if (Array.isArray(response.data)) {
          setDiseases(response.data);
        } else if (response.data && Array.isArray(response.data.diseases)) {
          setDiseases(response.data.diseases);
        } else if (response.data && response.data.data) {
          setDiseases(response.data.data);
        } else {
          console.warn('Неожиданный формат ответа:', response.data);
          setDiseases([]);
        }
      } catch (err) {
        console.error('Ошибка загрузки истории болезней:', err);
        setError('Не удалось загрузить историю болезней');
        
        // Для отладки вернем тестовые данные
        setDiseases(getMockDiseases());
      } finally {
        setLoading(false);
      }
    };

    fetchDiseases();
  }, []);

  return { diseases, loading, error };
};

// Тестовые данные для разработки
const getMockDiseases = () => [
  {
    id: '1',
    disease_code: 'J06.9',
    disease_name: 'Острая инфекция верхних дыхательных путей',
    first_detected: '2024-01-15T10:30:00Z',
    last_detected: '2024-01-20T14:45:00Z',
    is_active: true
  },
  {
    id: '2',
    disease_code: 'I10',
    disease_name: 'Эссенциальная гипертензия',
    first_detected: '2023-11-10T09:15:00Z',
    last_detected: '2024-02-01T11:20:00Z',
    is_active: true
  },
  {
    id: '3', 
    disease_code: 'M54.5',
    disease_name: 'Боль в поясничном отделе позвоночника',
    first_detected: '2023-12-05T16:30:00Z',
    last_detected: '2024-01-25T13:10:00Z',
    is_active: false
  }
];