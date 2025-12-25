const Card = ({ children, style = {} }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    ...style
  }}>
    {children}
  </div>
);

export default Card;