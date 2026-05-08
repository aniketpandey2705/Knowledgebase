import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function ModalBase({ 
  children, 
  title, 
  onClose, 
  maxWidth = '500px',
  hasUnsavedChanges = false 
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (hasUnsavedChanges) {
          if (window.confirm("You have unsaved changes. Discard?")) onClose();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, hasUnsavedChanges]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      if (hasUnsavedChanges) {
        if (window.confirm("You have unsaved changes. Discard?")) onClose();
      } else {
        onClose();
      }
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 2000, padding: '20px'
      }}
    >
      <div 
        ref={modalRef}
        className="raised-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          width: '100%', maxWidth, padding: '32px', position: 'relative',
          animation: 'modalEnter 0.2s ease-out forwards'
        }}
      >
        <button 
          onClick={onClose}
          aria-label="Close modal"
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
        >
          <X size={20} />
        </button>

        {title && <h2 id="modal-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '24px' }}>{title}</h2>}
        
        {children}
      </div>
    </div>
  );
}
