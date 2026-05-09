import React, { useState } from 'react';
import { File, Image as ImageIcon, HelpCircle, FileText, ChevronRight, ArrowLeft, Download, ExternalLink, X } from 'lucide-react';
import { formattedDate } from '../../utils/timeUtils';
import { wordCount } from '../../utils/textUtils';
import { useBrowse } from '../../hooks/useBrowse';
import { ContentSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';
import { Lightbox } from '../ui/Lightbox';

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
              style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderLeft: '3px solid var(--color-accent)' }}
            >
              {item.type === 'image' ? (
                <div 
                  onClick={() => setLightboxImage({ url: item.file_url, title: item.title, file_name: item.file_name })}
                  style={{ width: '100%', height: '160px', overflow: 'hidden', cursor: 'zoom-in' }}
                >
                  <img src={item.file_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.type === 'question' && <HelpCircle size={18} />}
                    {item.type === 'pdf' && <FileText size={18} />}
                    {item.type === 'note' && <FileText size={18} />}
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>{item.type}</span>
                  </div>
                </div>
              )}

              <div style={{ padding: '16px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div 
                    onClick={() => onNavigateToTopic(item.topic_id, item.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600, marginBottom: '6px', cursor: 'pointer' }}
                  >
                    <span>{item.topics?.name}</span>
                    <ChevronRight size={12} />
                    <span style={{ color: 'var(--color-text-disabled)', fontWeight: 400 }}>{formattedDate(item.created_at)}</span>
                  </div>
                  <h3 
                    onClick={() => onNavigateToTopic(item.topic_id, item.id)}
                    style={{ fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', lineHeight: '1.3' }}
                  >
                    {item.title}
                  </h3>
                  {item.type === 'pdf' && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{item.file_name}</p>}
                </div>

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
                        {expandedPdfId === item.id ? 'Close' : 'Preview'}
                      </Button>
                      <a href={item.file_url} download style={{ flex: 1, textDecoration: 'none' }}>
                        <Button variant="secondary" style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }} icon={Download}>Get</Button>
                      </a>
                    </div>
                    {expandedPdfId === item.id && (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div style={{ padding: '6px 10px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                          <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                            Full Screen <ExternalLink size={10} />
                          </a>
                        </div>
                        <iframe src={item.file_url} width="100%" height="300px" style={{ border: 'none' }} title={item.title} />
                      </div>
                    )}
                  </div>
                )}

                {item.type === 'image' && (
                  <Button variant="outline" onClick={() => setLightboxImage({ url: item.file_url, title: item.title, file_name: item.file_name })} style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}>
                    View Full Size
                  </Button>
                )}
                
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
                  <Button variant="outline" onClick={() => onNavigateToTopic(item.topic_id, item.id)} style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '100px' }}>Go to Topic</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Lightbox 
        image={lightboxImage} 
        onClose={() => setLightboxImage(null)} 
      />

      <style>{`
        .grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
      `}</style>
    </div>
  );
}
