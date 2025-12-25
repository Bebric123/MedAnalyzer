import React from 'react';

const FormErrorDisplay = ({ errors, fieldName, className = '' }) => {
    if (!errors || !errors[fieldName]) {
        return null;
    }

    const fieldErrors = errors[fieldName];
    
    return (
        <div className={`form-errors ${className}`}>
            {Array.isArray(fieldErrors) ? (
                fieldErrors.map((error, index) => (
                    <div 
                        key={index} 
                        className="error-message"
                        style={{
                            color: '#dc3545',
                            fontSize: '14px',
                            marginTop: '5px',
                            padding: '5px 10px',
                            backgroundColor: '#f8d7da',
                            border: '1px solid #f5c6cb',
                            borderRadius: '4px'
                        }}
                    >
                        ⚠️ {error}
                    </div>
                ))
            ) : (
                <div className="error-message">
                    ⚠️ {fieldErrors}
                </div>
            )}
        </div>
    );
};

export default FormErrorDisplay;