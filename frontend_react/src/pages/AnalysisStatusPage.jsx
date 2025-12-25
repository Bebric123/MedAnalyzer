import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { checkAnalysisStatus, getAnalysisResult } from '../services/analysis';
import Card from '../components/Card';
import Button from '../components/Button';

const AnalysisStatusPage = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('pending');
    const [progress, setProgress] = useState(0);
    const [fileInfo, setFileInfo] = useState(null);
    const [error, setError] = useState(null);
    const [polling, setPolling] = useState(true);

    const statusMessages = {
        pending: { text: 'Ожидание начала анализа', color: '#f6ad55', progress: 10 },
        in_progress: { text: 'Анализ в процессе', color: '#4299e1', progress: 50 },
        completed: { text: 'Анализ завершен', color: '#48bb78', progress: 100 },
        failed: { text: 'Ошибка анализа', color: '#f56565', progress: 0 }
    };

    useEffect(() => {
        if (!sessionId) return;

        const checkStatus = async () => {
            try {
                const response = await checkAnalysisStatus(sessionId);
                if (response.data) {
                    setStatus(response.data.status);
                    setFileInfo({
                        filename: response.data.filename,
                        fileId: response.data.file_id
                    });

                    const statusInfo = statusMessages[response.data.status] || statusMessages.pending;
                    setProgress(statusInfo.progress);

                    if (response.data.status === 'completed' || response.data.status === 'failed') {
                        setPolling(false);
                        
                        if (response.data.status === 'completed' && response.data.file_id) {
                            setTimeout(() => {
                                navigate(`/results/${response.data.file_id}`);
                            }, 2000);
                        }
                    }
                }
            } catch (err) {
                setError('Ошибка при проверке статуса анализа');
                setPolling(false);
            }
        };

        checkStatus();

        let intervalId;
        if (polling) {
            intervalId = setInterval(checkStatus, 3000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [sessionId, polling, navigate]);

    const handleViewResults = () => {
        if (fileInfo?.fileId) {
            navigate(`/results/${fileInfo.fileId}`);
        }
    };

    const handleRetry = () => {
        navigate('/upload');
    };

    const currentStatus = statusMessages[status] || statusMessages.pending;

    return (
        <Card>
            <h2>Статус анализа</h2>
            
            {fileInfo && (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f7fafc', borderRadius: '5px' }}>
                    <p style={{ margin: '0 0 5px 0' }}><strong>Файл:</strong> {fileInfo.filename}</p>
                    <p style={{ margin: '0' }}><strong>ID сессии:</strong> {sessionId}</p>
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <div style={{
                    width: '100%',
                    height: '20px',
                    background: '#e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    marginBottom: '10px'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: currentStatus.color,
                        transition: 'width 0.5s ease-in-out'
                    }}></div>
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: currentStatus.color, fontWeight: 'bold' }}>
                        {currentStatus.text}
                    </span>
                    <span>{progress}%</span>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: '15px',
                    background: '#fed7d7',
                    color: '#c53030',
                    borderRadius: '5px',
                    marginBottom: '20px'
                }}>
                    ❌ {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {status === 'completed' && fileInfo?.fileId && (
                    <Button variant="primary" onClick={handleViewResults}>
                        Посмотреть результаты
                    </Button>
                )}
                
                {status === 'failed' && (
                    <Button variant="secondary" onClick={handleRetry}>
                        Попробовать снова
                    </Button>
                )}

                <Button variant="outline" onClick={() => navigate('/upload')}>
                    Загрузить новый файл
                </Button>
            </div>

            <div style={{ marginTop: '30px', fontSize: '14px', color: '#718096' }}>
                <p><strong>Что происходит сейчас:</strong></p>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    {status === 'pending' && (
                        <>
                            <li>Файл загружен на сервер</li>
                            <li>Подготовка к анализу</li>
                            <li>Ожидание очереди на обработку</li>
                        </>
                    )}
                    {status === 'in_progress' && (
                        <>
                            <li>Извлечение текста из файла</li>
                            <li>Анализ через GigaChat AI</li>
                            <li>Обработка результатов</li>
                        </>
                    )}
                    {status === 'completed' && (
                        <>
                            <li>Анализ успешно завершен</li>
                            <li>Результаты готовы к просмотру</li>
                            <li>Данные сохранены в вашей истории</li>
                        </>
                    )}
                    {status === 'failed' && (
                        <>
                            <li>Возникла ошибка при анализе</li>
                            <li>Проверьте формат и содержимое файла</li>
                            <li>Попробуйте загрузить файл снова</li>
                        </>
                    )}
                </ul>
            </div>
        </Card>
    );
};

export default AnalysisStatusPage;