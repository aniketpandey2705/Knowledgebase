import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Container component to hold multiple toasts
export function ToastContainer({ toasts, dismissToast }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 9999,
      pointerEvents: 'none' // Let clicks pass through empty space
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { message, type } = toast;
  
  const typeConfig = {
    success: { color: '#34C759', icon: <CheckCircle size={18} color="#34C759" /> },
    error: { color: 'var(--danger)', icon: <AlertCircle size={18} color="var(--danger)" /> },
    info: { color: 'var(--accent)', icon: <Info size={18} color="var(--accent)" /> },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div 
      className="raised-card"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 16px',
        minWidth: '300px',
        maxWidth: '400px',
        borderLeft: `4px solid ${config.color}`,
        pointerEvents: 'auto',
        animation: 'slideIn 0.2s ease-out forwards',
        background: 'var(--base)'
      }}
    >
      <div style={{ marginTop: '2px' }}>
        {config.icon}
      </div>
      
      <div style={{ flex: 1, color: 'var(--accent)', fontSize: '0.9rem', lineHeight: 1.4, marginTop: '2px' }}>
        {message}
      </div>
      
      <button 
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px'
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
