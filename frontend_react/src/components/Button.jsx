const Button = ({ children, variant = 'primary', onClick, disabled = false, style = {}, ...props }) => {
  const base = {
    padding: '0.65rem 1.25rem',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: 'none',
    ...style
  };

  const variants = {
    primary: { ...base, backgroundColor: '#516e83ff', color: 'white' },
    secondary: { ...base, backgroundColor: '#e2e8f0', color: '#2d3748' },
    upload: { ...base, backgroundColor: '#516e83ff', color: 'white' },
    outline: { ...base, backgroundColor: '#516e83ff', color: 'white' }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={variants[variant]}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;