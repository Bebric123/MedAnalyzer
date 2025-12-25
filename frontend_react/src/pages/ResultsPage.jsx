// ResultsPage.jsx или аналогичный
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAnalysisResult } from '../services/analysis';
import ResultCard from '../components/ResultCard';

const ResultsPage = () => {
    const { fileId } = useParams();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                console.log('📥 Запрашиваем результаты для fileId:', fileId);
                
                const response = await getAnalysisResult(fileId);
                console.log('📤 Получен ответ:', response.data);
                
                // Проверяем структуру ответа
                if (response.data) {
                    // Формируем объект для ResultCard
                    const resultData = {
                        filename: response.data.filename,
                        created_at: response.data.end_time || response.data.start_time,
                        summary: response.data.summary,
                        detected_conditions: response.data.detected_conditions || [],
                        recommendations: response.data.recommendations,
                        // Дополнительные поля
                        analysis_date: response.data.analysis_date,
                        confidence: response.data.overall_confidence
                    };
                    
                    console.log('Данные для ResultCard:', resultData);
                    setResult(resultData);
                } else {
                    setError('Нет данных в ответе');
                }
            } catch (err) {
                console.error('❌ Ошибка загрузки результатов:', err);
                setError('Ошибка загрузки результатов');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [fileId]);

    if (loading) return <div>Загрузка результатов...</div>;
    if (error) return <div>Ошибка: {error}</div>;
    if (!result) return <div>Результаты не найдены</div>;

    return (
        <div>
            <h1>Результаты анализа</h1>
            {result.analysis_date && (
                <p>Дата анализа: {result.analysis_date}</p>
            )}
            <ResultCard result={result} />
        </div>
    );
};

export default ResultsPage;