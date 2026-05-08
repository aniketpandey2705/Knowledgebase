import React from 'react';

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="form-group" style={{ width: '100%' }}>
      {label && <label className="form-label">{label}</label>}
      <input 
        className={`recessed-input ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}

export function Textarea({ label, error, maxLength, value, ...props }) {
  const currentLength = value?.length || 0;
  const showCount = maxLength && currentLength > maxLength * 0.8;

  return (
    <div className="form-group" style={{ width: '100%' }}>
      {label && <label className="form-label">{label}</label>}
      <textarea 
        className={`recessed-input ${error ? 'error' : ''}`}
        value={value}
        {...props}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        {error ? <div className="error-text">{error}</div> : <div />}
        {showCount && (
          <div style={{ 
            fontSize: '0.75rem', 
            color: currentLength >= maxLength ? 'var(--danger)' : 'var(--text-secondary)' 
          }}>
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
}
