import React, { useState } from 'react';
import { Plus, MoreHorizontal, FileText, Image as ImageIcon, HelpCircle, File, Download } from 'lucide-react';
import { ContentSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';

export default function TopicDetail({ topic, content, loading, onOpenModal }) {
  const [activeTab, setActiveTab] = useState('question');

  if (!topic) return null;

  const filteredContent = content.filter(item => item.type === activeTab);
  const tabs = [
    { id: 'question', label: 'Questions', icon: <HelpCircle size={16} /> },
    { id: 'pdf', label: 'PDFs', icon: <File size={16} /> },
    { id: 'image', label: 'Images', icon: <ImageIcon size={16} /> },
    { id: 'note', label: 'Notes', icon: <FileText size={16} /> },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>
          {topic.icon} {topic.name}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {topic.aliases?.map((alias, i) => (
            <span key={i} className="chip">{alias}</span>
          ))}
        </div>
      </header>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', overflowX: 'auto' }}>
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
            />
          ))}
        </div>
      )}

      <button 
        onClick={() => onOpenModal('addContent', { topicId: topic.id, defaultType: activeTab })}
        className="btn-active-effect"
        style={{
          position: 'fixed', bottom: '40px', right: '40px', width: '56px', height: '56px', borderRadius: '28px',
          backgroundColor: 'var(--color-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer', zIndex: 10
        }}
      >
        <Plus size={24} />
      </button>

      <style>{`
        .grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
        .chip { padding: 4px 10px; border: 1px solid var(--color-border); borderRadius: 100px; fontSize: 0.75rem; fontFamily: var(--font-mono); color: var(--color-text-secondary); background: var(--color-base); }
        @media (max-width: 800px) { .grid-layout { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

function ContentCard({ item, onEdit, onDelete }) {
  const date = new Date(item.created_at).toLocaleDateString();
  
  return (
    <div className="raised-card" style={{ padding: '24px', borderLeft: '3px solid var(--color-accent)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ color: 'var(--color-text-secondary)' }}>
          {item.type === 'question' && <HelpCircle size={18} />}
          {item.type === 'pdf' && <File size={18} />}
          {item.type === 'image' && <ImageIcon size={18} />}
          {item.type === 'note' && <FileText size={18} />}
        </div>
        <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-disabled)' }}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.title}</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-disabled)' }}>{date}</p>
      </div>

      {(item.type === 'question' || item.type === 'note') && (
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.body}
        </p>
      )}

      {item.type === 'pdf' && (
        <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="btn-active-effect" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500, padding: '8px 12px', backgroundColor: 'var(--color-bg)', borderRadius: '6px' }}>
          <Download size={14} /> {item.file_name || 'Download PDF'}
        </a>
      )}

      {item.type === 'image' && item.file_url && (
        <div style={{ width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
          <img src={item.file_url} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
         <button onClick={onDelete} style={{ fontSize: '0.8rem', color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
      </div>
    </div>
  );
}
