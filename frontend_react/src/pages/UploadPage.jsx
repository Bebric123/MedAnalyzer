import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { useUpload } from '../hooks/useUpload';
import Card from '../components/Card';
import Button from '../components/Button';

const UploadPage = () => {
    const navigate = useNavigate();
    const { upload, uploading, error, success, data, sessionId, fileId } = useUpload();
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [description, setDescription] = useState('');

    const handleFileSelect = (file) => {
        console.log("Файл выбран:", file);
        setSelectedFile(file);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleUpload = async () => {
        if (selectedFile) {
            console.log("Начинаем загрузку файла:", selectedFile.name);
            const result = await upload(selectedFile, description);
            console.log("Результат загрузки:", result);
            
            if (sessionId) {
                console.log("Есть sessionId, редирект через 1.5 секунды");
                setTimeout(() => {
                    navigate(`/analysis/status/${sessionId}`);
                }, 1500);
            } else if (fileId) {
                console.log("Есть fileId, редирект на результаты");
                setTimeout(() => {
                    navigate(`/results/${fileId}`);
                }, 1500);
            }
        }
    };

    return (
        <Card>
            <h2 style={{ marginBottom: '25px' }}>Загрузка медицинского файла</h2>
            
            {(success || error) && (
                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    borderRadius: '8px',
                    background: success ? '#d4edda' : '#f8d7da',
                    color: success ? '#155724' : '#721c24',
                    border: `1px solid ${success ? '#c3e6cb' : '#f5c6cb'}`,
                    animation: 'fadeIn 0.3s ease-in'
                }}>
                    {success ? (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                <span style={{ fontSize: '20px', marginRight: '8px' }}>✅</span>
                                <strong>Успешно!</strong>
                            </div>
                            <p style={{ margin: 0 }}>{success}</p>
                            
                            {data && (
                                <div style={{ marginTop: '10px' }}>
                                    {data.analysis_summary && (
                                        <p><strong>Результат:</strong> {data.analysis_summary}</p>
                                    )}
                                    {sessionId && (
                                        <p style={{ fontSize: '14px', color: '#0c5460' }}>
                                            <strong>ID анализа:</strong> {sessionId}
                                        </p>
                                    )}
                                </div>
                            )}
                            
                            {(sessionId || fileId) && (
                                <div style={{ 
                                    marginTop: '15px', 
                                    padding: '10px', 
                                    background: 'rgba(255,255,255,0.5)', 
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => navigate(sessionId ? `/analysis/status/${sessionId}` : `/results/${fileId}`)}
                                            style={{
                                                padding: '5px 10px',
                                                background: '#518352ff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Перейти сейчас
                                        </button>
                                        <button
                                            onClick={() => window.location.reload()}
                                            style={{
                                                padding: '5px 10px',
                                                background: '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Загрузить ещё
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                <span style={{ fontSize: '20px', marginRight: '8px' }}>❌</span>
                                <strong>Ошибка!</strong>
                            </div>
                            <p style={{ margin: 0 }}>{error}</p>
                        </div>
                    )}
                </div>
            )}

            {!success && (
                <>

                    <FileUploader 
                        onFileSelect={handleFileSelect} 
                        disabled={uploading}
                    />
                    
                    {selectedFile && (
                        <div style={{ 
                            marginTop: '15px', 
                            padding: '12px', 
                            background: '#e8f5e9', 
                            borderRadius: '5px',
                            border: '1px solid #c8e6c9'
                        }}>
                            <p style={{ margin: '0', color: '#2e7d32' }}>
                                <strong>Выбран файл:</strong> {selectedFile.name}
                            </p>
                            <p style={{ margin: '5px 0 0 0', color: '#2e7d32', fontSize: '14px' }}>
                                Размер: {(selectedFile.size / 1024).toFixed(1)} KB • Тип: {selectedFile.type || 'не определен'}
                            </p>
                        </div>
                    )}

                    <Button
                        variant="primary"
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                        style={{ 
                            width: '100%', 
                            marginTop: '20px',
                            padding: '12px',
                            fontSize: '16px'
                        }}
                    >
                        {uploading ? (
                            <>
                                <span style={{ marginRight: '8px' }}></span>
                                Загрузка и анализ...
                            </>
                        ) : 'Загрузить и проанализировать'}
                    </Button>
                </>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Card>
    );
};

export default UploadPage;