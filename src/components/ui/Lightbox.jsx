import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from './Button';

export function Lightbox({ image, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!image) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        cursor: 'zoom-out'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()} 
        style={{ 
          position: 'relative', 
          width: '90vw', 
          height: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'default'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '20px', 
          color: 'white',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)'
        }}>
          <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{image.title}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a 
              href={image.url} 
              download={image.file_name || true}
              style={{ 
                color: 'white', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '0.9rem',
                opacity: 0.8,
                transition: 'opacity 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.opacity = 1}
              onMouseOut={e => e.currentTarget.style.opacity = 0.8}
            >
              <Download size={18} /> Download
            </a>
            <Button 
              variant="icon" 
              onClick={onClose} 
              style={{ color: 'white', padding: 0 }}
            >
              <X size={28} />
            </Button>
          </div>
        </div>
        
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          overflow: 'hidden',
          padding: '20px'
        }}>
          <img
            src={image.url}
            alt={image.title}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
