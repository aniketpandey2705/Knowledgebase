import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function DeleteAccountModal({ onConfirm, onClose, loading }) {
  const [confirmText, setConfirmText] = useState('');

  const isEnabled = confirmText === 'DELETE';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="raised-card" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '32px',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '24px', 
          backgroundColor: 'rgba(255,59,48,0.1)', 
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <AlertCircle size={24} />
        </div>

        <h2 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '1.5rem', 
          marginBottom: '12px' 
        }}>
          Delete Account?
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
          This action is **permanent** and cannot be undone. All your topics, content, and files will be permanently removed.
        </p>

        <div className="form-group" style={{ marginBottom: '32px' }}>
          <label className="form-label" style={{ color: 'var(--danger)', fontWeight: 700 }}>
            Type DELETE to confirm
          </label>
          <input 
            type="text"
            className="recessed-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            style={{ borderColor: confirmText && !isEnabled ? 'var(--danger)' : 'var(--border)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onClose}
            className="primary-button"
            style={{ backgroundColor: 'var(--disabled)', background: 'var(--disabled)', flex: 1 }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="primary-button"
            disabled={!isEnabled || loading}
            style={{ 
              backgroundColor: isEnabled ? 'var(--danger)' : 'var(--disabled)', 
              background: isEnabled ? 'var(--danger)' : 'var(--disabled)',
              flex: 1 
            }}
          >
            {loading ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
