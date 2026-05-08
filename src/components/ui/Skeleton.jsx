import React from 'react';

export function Skeleton({ width, height, borderRadius = '4px', className = '' }) {
  return (
    <div 
      className={`skeleton-pulse ${className}`}
      style={{ 
        width, 
        height, 
        borderRadius, 
        backgroundColor: '#eee',
        marginBottom: '8px'
      }} 
    />
  );
}

export function SidebarSkeleton() {
  return (
    <div style={{ padding: '0 12px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Skeleton width="20px" height="20px" />
          <Skeleton width={`${Math.random() * 40 + 40}%`} height="14px" />
        </div>
      ))}
    </div>
  );
}

export function ContentSkeleton() {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
      gap: '20px' 
    }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="raised-card" style={{ padding: '24px', height: '180px' }}>
          <Skeleton width="30%" height="18px" />
          <Skeleton width="20%" height="12px" />
          <div style={{ marginTop: '24px' }}>
            <Skeleton width="100%" height="12px" />
            <Skeleton width="90%" height="12px" />
            <Skeleton width="40%" height="12px" />
          </div>
        </div>
      ))}
    </div>
  );
}
