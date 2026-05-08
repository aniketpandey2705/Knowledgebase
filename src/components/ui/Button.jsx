import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({ 
  children, 
  loading, 
  className = '', 
  variant = 'primary', 
  icon: Icon,
  disabled,
  style: customStyle,
  ...props 
}) {
  const baseStyle = {
    borderRadius: '8px',
    border: 'none',
    padding: '10px 20px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms ease-in-out',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    textDecoration: 'none',
    boxSizing: 'border-box'
  };

  const variants = {
    primary: {
      background: 'linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%)',
      color: '#FFFFFF',
      boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 8px rgba(0,0,0,0.2)',
    },
    secondary: {
      background: '#FFFFFF',
      color: '#2C2C2E',
      border: '1px solid rgba(0,0,0,0.12)',
    },
    danger: {
      background: 'linear-gradient(180deg, #ff453a 0%, #d93025 100%)',
      color: '#FFFFFF',
      boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset, 0 2px 8px rgba(0,0,0,0.2)',
    },
    outline: {
      background: 'transparent',
      border: '1px solid var(--color-border)',
      color: 'var(--color-accent)',
    },
    icon: {
      background: 'transparent',
      border: 'none',
      padding: '6px',
      borderRadius: '6px',
      color: '#6C6C70',
    }
  };

  const activeStyle = (disabled || loading) ? {
    opacity: 0.4,
    pointerEvents: 'none',
    cursor: 'not-allowed'
  } : {};

  const style = { ...baseStyle, ...variants[variant], ...activeStyle, ...customStyle };

  return (
    <button 
      disabled={disabled || loading} 
      style={style}
      className={`btn-active-effect ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
}
