import React, { useState } from 'react';
import { Plus, MoreHorizontal, FileText, Image as ImageIcon, HelpCircle, File, Download, ExternalLink } from 'lucide-react';

export default function TopicDetail({ 
  topic, 
  content, 
  loading, 
  onOpenModal 
}) {
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
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '12px',
          fontFamily: 'var(--font-heading)'
        }}>
          {topic.icon} {topic.name}
        </h1>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {topic.aliases?.map((alias, i) => (
            <span key={i} style={{
              padding: '4px 10px',
              border: '1px solid var(--border)',
              borderRadius: '100px',
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              backgroundColor: 'white'
            }}>
              {alias}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '32px',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '16px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '100px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              backgroundColor: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              transition: 'all 150ms ease'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid-layout">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredContent.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px dashed var(--border)'
        }}>
          <div style={{ color: 'var(--disabled)', marginBottom: '16px' }}>
            {tabs.find(t => t.id === activeTab).icon}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>No {activeTab}s found in this topic.</p>
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

      {/* Floating Add Button */}
      <button 
        onClick={() => onOpenModal('addContent', { topicId: topic.id, defaultType: activeTab })}
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: 'var(--accent)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        <Plus size={24} />
      </button>

      <style>{`
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }
        @media (max-width: 800px) {
          .grid-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function ContentCard({ item, onEdit, onDelete }) {
  const date = new Date(item.created_at).toLocaleDateString();
  
  return (
    <div className="raised-card" style={{ 
      padding: '24px', 
      borderLeft: '3px solid var(--accent)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ color: 'var(--text-secondary)' }}>
          {item.type === 'question' && <HelpCircle size={18} />}
          {item.type === 'pdf' && <File size={18} />}
          {item.type === 'image' && <ImageIcon size={18} />}
          {item.type === 'note' && <FileText size={18} />}
        </div>
        
        <button 
          onClick={onEdit} // For now clicking "..." just opens edit
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--disabled)' }}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>{item.title}</h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--disabled)' }}>{date}</p>
      </div>

      {(item.type === 'question' || item.type === 'note') && (
        <p style={{ 
          fontSize: '0.9rem', 
          color: 'var(--text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {item.body}
        </p>
      )}

      {item.type === 'pdf' && (
        <a 
          href={item.file_url} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.85rem',
            color: 'var(--accent)',
            textDecoration: 'none',
            fontWeight: 500,
            padding: '8px 12px',
            backgroundColor: 'var(--background)',
            borderRadius: '6px'
          }}
        >
          <Download size={14} />
          {item.file_name || 'Download PDF'}
        </a>
      )}

      {item.type === 'image' && item.file_url && (
        <div style={{
          width: '100%',
          height: '160px',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'var(--background)'
        }}>
          <img 
            src={item.file_url} 
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
         <button 
           onClick={onDelete}
           style={{ 
             fontSize: '0.8rem', 
             color: 'var(--danger)', 
             background: 'none', 
             border: 'none', 
             cursor: 'pointer' 
           }}
         >
           Delete
         </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="raised-card" style={{ padding: '24px', height: '180px' }}>
      <div style={{ height: '18px', width: '60%', backgroundColor: '#eee', borderRadius: '4px', marginBottom: '12px' }} className="skeleton-pulse" />
      <div style={{ height: '12px', width: '40%', backgroundColor: '#eee', borderRadius: '4px', marginBottom: '24px' }} className="skeleton-pulse" />
      <div style={{ height: '12px', width: '90%', backgroundColor: '#eee', borderRadius: '4px', marginBottom: '8px' }} className="skeleton-pulse" />
      <div style={{ height: '12px', width: '80%', backgroundColor: '#eee', borderRadius: '4px' }} className="skeleton-pulse" />
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .skeleton-pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
