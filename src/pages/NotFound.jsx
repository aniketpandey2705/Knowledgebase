import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "Not Found — Knowledge Base";
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '6rem', 
        lineHeight: 1, 
        marginBottom: '16px',
        color: 'var(--accent)'
      }}>
        404
      </h1>
      
      <p style={{ 
        fontSize: '1.25rem', 
        color: 'var(--text-secondary)',
        marginBottom: '32px'
      }}>
        This page doesn't exist.
      </p>

      <button 
        className="primary-button" 
        onClick={() => navigate('/home')}
        style={{ width: 'auto', padding: '12px 32px' }}
      >
        Go Home
      </button>
    </div>
  );
}
