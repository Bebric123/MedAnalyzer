const Input = ({ label, type = 'text', placeholder, required = false, ...props }) => (
  <div style={{ marginBottom: '1.2rem' }}>
    {label && (
      <label style={{
        display: 'block',
        marginBottom: '0.4rem',
        fontWeight: '500',
        fontSize: '0.95rem'
      }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      required={required}
      style={{
        width: '100%',
        padding: '0.65rem',
        border: '1px solid #cbd5e0',
        borderRadius: '4px',
        fontSize: '1rem'
      }}
      {...props}
    />
  </div>
);

export default Input;