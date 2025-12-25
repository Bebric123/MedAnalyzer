import { useState } from 'react';
import { uploadFile } from '../services/files';

export const useUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [data, setData] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [fileId, setFileId] = useState(null);

    const upload = async (file, description = '') => {
        setUploading(true);
        setError(null);
        setSuccess(null);
        setData(null);
        setSessionId(null);
        setFileId(null);

        try {
            const response = await uploadFile(file, description);
            
            console.log("Ответ от сервера:", response.data);
            
            // Проверяем разные форматы ответа
            if (response.data.success === true || response.data.success === false) {
                // Новый формат с полем success
                if (response.data.success) {
                    setSuccess(response.data.message || 'Файл успешно загружен');
                    setData(response.data.data || response.data);
                    setSessionId(response.data.data?.session_id || response.data.session_id);
                    setFileId(response.data.data?.file?.id || response.data.file?.id || response.data.id);
                } else {
                    setError(response.data.message || 'Ошибка при загрузке файла');
                }
            } else if (response.data.id && response.data.message) {
                // Старый формат (без поля success)
                setSuccess(response.data.message);
                setData(response.data);
                setSessionId(response.data.session_id);
                setFileId(response.data.file?.id || response.data.id);
            } else if (response.data.error) {
                // Формат с полем error
                setError(response.data.error);
            } else {
                // Неизвестный формат
                setError('Неизвестный формат ответа от сервера');
            }
            
            return response.data;
        } catch (err) {
            console.error("Ошибка загрузки:", err);
            
            if (err.response?.data) {
                const responseData = err.response.data;
                
                if (responseData.errors) {
                    const errors = responseData.errors;
                    if (errors.file) {
                        setError(errors.file.join(', '));
                    } else if (errors.non_field_errors) {
                        setError(errors.non_field_errors.join(', '));
                    } else {
                        const allErrors = Object.values(errors).flat();
                        setError(allErrors.join(', '));
                    }
                } else if (responseData.message) {
                    setError(responseData.message);
                } else if (responseData.error) {
                    setError(responseData.error);
                } else {
                    setError('Ошибка сервера');
                }
            } else if (err.request) {
                setError('Нет ответа от сервера');
            } else {
                setError('Ошибка при выполнении запроса');
            }
        } finally {
            setUploading(false);
        }
    };

    return {
        upload,
        uploading,
        error,
        success,
        data,
        sessionId,
        fileId,
        reset: () => {
            setError(null);
            setSuccess(null);
            setData(null);
            setSessionId(null);
            setFileId(null);
        }
    };
};