import React, { useState } from 'react';
import { File, Image as ImageIcon, HelpCircle, FileText, ChevronRight, ArrowLeft, Download, ExternalLink, X } from 'lucide-react';
import { formattedDate } from '../../utils/timeUtils';
import { wordCount } from '../../utils/textUtils';
import { useBrowse } from '../../hooks/useBrowse';
import { ContentSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';

export default function BrowseView({ type, onNavigateToTopic, onClose }) {
  const { content, loading } = useBrowse(type);
  const [expandedPdfId, setExpandedPdfId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const config = {
    pdf: { label: 'All PDFs', icon: <File size={32} /> },
    image: { label: 'All Images', icon: <ImageIcon size={32} /> },
    question: { label: 'All Questions', icon: <HelpCircle size={32} /> },
    note: { label: 'All Notes', icon: <FileText size={32} /> },
  };

  const { label, icon } = config[type] || config.note;

  // Calculate stats
  const itemCount = content.length;
  const uniqueTopics = new Set(content.map(c => c.topic_id)).size;

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <Button variant="outline" onClick={onClose} style={{ width: '40px', padding: 0 }}><ArrowLeft size={20} /></Button>
          <div style={{ color: 'var(--color-accent)' }}>{icon}</div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>{label}</h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>{itemCount} items across {uniqueTopics} topics</p>
          </div>
        </div>
      </header>

      {loading ? (
        <ContentSkeleton />
      ) : content.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>No {type}s found across your topics.</p>
        </div>
      ) : (
        <div className="grid-layout">
          {content.map(item => (
            <div 
              key={item.id} 
              className="raised-card" 
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '3px solid var(--color-accent)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <span onClick={() => onNavigateToTopic(item.topic_id, item.id)} style={{ cursor: 'pointer', color: 'var(--color-accent)', fontWeight: 600 }}>{item.topics?.name}</span>
                  <ChevronRight size={12} />
                  <span>{formattedDate(item.created_at)}</span>
                </div>
                <div style={{ color: 'var(--color-text-disabled)' }}>
                  {item.type === 'question' && <HelpCircle size={16} />}
                  {item.type === 'pdf' && <File size={16} />}
                  {item.type === 'image' && <ImageIcon size={16} />}
                  {item.type === 'note' && <FileText size={16} />}
                </div>
              </div>

              <h3 
                onClick={() => onNavigateToTopic(item.topic_id, item.id)}
                style={{ fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {item.title}
              </h3>

              {(item.type === 'question' || item.type === 'note') && (
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                    {item.body}
                  </p>
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--color-text-disabled)' }}>
                    {wordCount(item.body)} words
                  </div>
                </div>
              )}

              {item.type === 'pdf' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="outline" onClick={() => setExpandedPdfId(expandedPdfId === item.id ? null : item.id)} style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}>
                      {expandedPdfId === item.id ? 'Close Preview' : 'Preview'}
                    </Button>
                    <a href={item.file_url} download style={{ flex: 1, textDecoration: 'none' }}>
                      <Button variant="secondary" style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }} icon={Download}>Download</Button>
                    </a>
                  </div>
                  {expandedPdfId === item.id && (
                    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <iframe src={item.file_url} width="100%" height="300px" style={{ border: 'none' }} title={item.title} />
                    </div>
                  )}
                </div>
              )}

              {item.type === 'image' && item.file_url && (
                <div 
                  onClick={() => setLightboxImage({ url: item.file_url, title: item.title })}
                  style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', cursor: 'zoom-in', border: '1px solid var(--color-border)' }}
                >
                  <img src={item.file_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outline" onClick={() => onNavigateToTopic(item.topic_id, item.id)} style={{ padding: '4px 12px', fontSize: '0.75rem' }}>View in Topic</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '90vw', height: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', color: 'white' }}>
              <span style={{ fontWeight: 600 }}>{lightboxImage.title}</span>
              <Button variant="icon" onClick={() => setLightboxImage(null)} style={{ color: 'white', padding: 0 }}><X size={24} /></Button>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src={lightboxImage.url} alt={lightboxImage.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
      `}</style>
    </div>
  );
}
