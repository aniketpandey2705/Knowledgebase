import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

export default function DeleteConfirmModal({ 
  title, 
  itemName, 
  onConfirm, 
  onClose,
  loading 
}) {
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
        maxWidth: '400px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '24px', 
          backgroundColor: 'rgba(255,59,48,0.1)', 
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <AlertTriangle size={24} />
        </div>

        <h2 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '1.5rem', 
          marginBottom: '12px' 
        }}>
          {title || 'Are you sure?'}
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px' }}>
          This action cannot be undone. You are about to delete <strong>{itemName}</strong>.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button 
            variant="secondary"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button 
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            style={{ flex: 1 }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
