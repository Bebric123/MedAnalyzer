import React from 'react';
import Button from './Button';

const FileUploader = ({ onFileSelect }) => {
  const handleFileChange = (e) => {
    console.log("Файл выбран:", e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div style={{
      border: '2px dashed #cbd5e0',
      borderRadius: '8px',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#fff',
      cursor: 'pointer'
    }}>
      <input
        type="file"
        onChange={handleFileChange}
        accept=".dcm,.pdf,.docx"
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
        <p><strong>Выберите файл</strong> или перетащите его сюда</p>
        <p style={{ fontSize: '0.85rem', color: '#718096' }}>
          Поддерживаются: DICOM, PDF, DOCX (макс. 50 МБ)
        </p>
        <Button variant="upload" style={{ marginTop: '1rem' }}>Выбрать файл</Button>
      </label>
    </div>
  );
};

export default FileUploader;