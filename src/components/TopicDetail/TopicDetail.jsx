import React, { useState, useMemo } from 'react';
import { Plus, MoreHorizontal, FileText, Image as ImageIcon, HelpCircle, File, Download, X, ExternalLink } from 'lucide-react';
import { relativeTime, formattedDate } from '../../utils/timeUtils';
import { wordCount } from '../../utils/textUtils';
import { ContentSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';
import { Lightbox } from '../ui/Lightbox';

export default function TopicDetail({ topic, content, loading, onOpenModal, highlightContentId, setHighlightContentId }) {
  const [activeTab, setActiveTab] = useState('question');
  const [expandedPdfId, setExpandedPdfId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const counts = useMemo(() => {
    return {
      question: content.filter(c => c.type === 'question').length,
      pdf: content.filter(c => c.type === 'pdf').length,
      image: content.filter(c => c.type === 'image').length,
      note: content.filter(c => c.type === 'note').length,
    };
  }, [content]);

  // Handle highlight auto-tab and scroll
  React.useEffect(() => {
    if (!highlightContentId || !content.length) return;
    const item = content.find(c => c.id === highlightContentId);
    if (item) setActiveTab(item.type);
  }, [highlightContentId, content]);

  React.useEffect(() => {
    if (!highlightContentId) return;
    
    const timer = setTimeout(() => {
      const el = document.getElementById(`content-${highlightContentId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'box-shadow 300ms ease';
        el.style.boxShadow = '0 0 0 2px #2C2C2E';
        
        setTimeout(() => {
          el.style.boxShadow = '';
          setHighlightContentId(null);
        }, 1500);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [highlightContentId, activeTab, setHighlightContentId]);

  // Escape key for Lightbox
  React.useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setLightboxImage(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!topic) return null;

  const filteredContent = content.filter(item => item.type === activeTab);
  const tabs = [
    { id: 'question', label: 'Questions', icon: <HelpCircle size={16} /> },
    { id: 'pdf', label: 'PDFs', icon: <File size={16} /> },
    { id: 'image', label: 'Images', icon: <ImageIcon size={16} /> },
    { id: 'note', label: 'Notes', icon: <FileText size={16} /> },
  ];

  return (
    <div className="topic-detail-container" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <header className="topic-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 className="topic-title" style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>{topic.name}</h1>
          {topic.icon && <span className="topic-icon" style={{ fontSize: '2rem' }}>{topic.icon}</span>}
        </div>
        
        {topic.aliases?.length > 0 && (
          <div className="topic-aliases" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {topic.aliases.map((alias, i) => (
              <span key={i} className="chip">#{alias}</span>
            ))}
          </div>
        )}

        <div className="topic-stats" style={{ color: '#6C6C70', fontFamily: 'var(--font-body)', fontSize: '13px', marginBottom: '4px' }}>
          {counts.question} Questions  &bull;  {counts.pdf} PDFs  &bull;  {counts.image} Images  &bull;  {counts.note} Notes
        </div>

        <div style={{ color: '#6C6C70', fontSize: '12px' }}>
          Last updated {relativeTime(topic.updated_at)}
        </div>
      </header>

      <div className="topic-tabs" style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '100px',
              border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
              backgroundColor: activeTab === tab.id ? 'var(--color-accent)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary)',
              transition: 'all 150ms ease', whiteSpace: 'nowrap'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ContentSkeleton />
      ) : filteredContent.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>No {activeTab}s yet.</p>
        </div>
      ) : (
        <div className="grid-layout">
          {filteredContent.map(item => (
            <ContentCard 
              key={item.id} 
              item={item} 
              onEdit={() => onOpenModal('editContent', item)}
              onDelete={() => onOpenModal('deleteContent', item)}
              isPdfExpanded={expandedPdfId === item.id}
              onTogglePdf={() => setExpandedPdfId(expandedPdfId === item.id ? null : item.id)}
              onOpenLightbox={() => setLightboxImage({ url: item.file_url, title: item.title, file_name: item.file_name })}
            />
          ))}
        </div>
      )}

      <Lightbox 
        image={lightboxImage} 
        onClose={() => setLightboxImage(null)} 
      />

      <Button 
        className="floating-add-btn"
        onClick={() => onOpenModal('addContent', { topicId: topic.id, defaultType: activeTab })}
        style={{
          position: 'fixed', bottom: '40px', right: '40px', width: '56px', height: '56px', borderRadius: '28px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 10, padding: 0
        }}
      >
        <Plus size={24} />
      </Button>

      <style>{`
        .grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
        .chip { padding: 4px 10px; border: 1px solid var(--color-border); borderRadius: 100px; fontSize: 0.75rem; fontFamily: var(--font-mono); color: var(--color-text-secondary); background: var(--color-base); }
        @media (max-width: 800px) { .grid-layout { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function ContentCard({ item, onEdit, onDelete, isPdfExpanded, onTogglePdf, onOpenLightbox }) {
  const date = formattedDate(item.created_at);
  
  return (
    <div id={`content-${item.id}`} className="raised-card" style={{ padding: '0', overflow: 'hidden', borderLeft: '3px solid var(--color-accent)', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease' }}>
      {item.type === 'image' ? (
        <div style={{ position: 'relative' }}>
          <img
            src={item.file_url}
            alt={item.title}
            loading="lazy"
            onClick={onOpenLightbox}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              cursor: 'zoom-in',
              display: 'block'
            }}
          />
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <Button variant="icon" onClick={onEdit} style={{ backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}>
              <MoreHorizontal size={18} />
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '24px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {item.type === 'question' && <HelpCircle size={18} />}
            {item.type === 'pdf' && <FileText size={18} />}
            {item.type === 'note' && <FileText size={18} />}
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.type}</span>
          </div>
          <Button variant="icon" onClick={onEdit}>
            <MoreHorizontal size={18} />
          </Button>
        </div>
      )}

      <div style={{ padding: item.type === 'image' ? '16px 24px 24px' : '0 24px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '4px', lineHeight: '1.3' }}>{item.title}</h3>
          {item.type === 'pdf' && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>{item.file_name}</p>}
          {item.tags?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {item.tags.map((tag, i) => (
                <span key={i} style={{ backgroundColor: '#F2F2F7', color: '#6C6C70', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>#{tag}</span>
              ))}
            </div>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)' }}>Added {date}</p>
        </div>

        {(item.type === 'question' || item.type === 'note') && (
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.6' }}>
            {item.body}
          </p>
        )}

        {item.type === 'pdf' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" onClick={onTogglePdf} style={{ flex: 1, fontSize: '0.85rem' }}>
                {isPdfExpanded ? 'Close Preview' : 'Preview'}
              </Button>
              <a href={item.file_url} download target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: 1 }}>
                <Button variant="secondary" style={{ width: '100%', fontSize: '0.85rem' }} icon={Download}>Download</Button>
              </a>
            </div>
            
            {isPdfExpanded && (
              <div style={{ marginTop: '12px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#F9F9F9' }}>
                <div style={{ padding: '10px 16px', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{item.file_name}</span>
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                    Open in new tab <ExternalLink size={14} />
                  </a>
                </div>
                <iframe src={item.file_url} className="pdf-preview-iframe" width="100%" height="500px" style={{ border: 'none' }} title={item.title} />
              </div>
            )}
          </div>
        )}

        {item.type === 'image' && (
          <div style={{ marginTop: '4px' }}>
            <Button variant="outline" onClick={onOpenLightbox} style={{ width: '100%', fontSize: '0.85rem' }}>
              View Full Size
            </Button>
          </div>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {(item.type === 'question' || item.type === 'note') ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)' }}>{wordCount(item.body)} words</span>
          ) : <span></span>}
          <Button variant="danger" onClick={onDelete} style={{ padding: '4px 8px', fontSize: '0.7rem', opacity: 0.6 }}>Delete</Button>
        </div>
      </div>
    </div>
  );
}
