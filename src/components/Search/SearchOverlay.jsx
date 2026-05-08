import React, { useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Folder, HelpCircle, File, Image as ImageIcon, FileText, ChevronRight } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';

export default function SearchOverlay({ onClose, onNavigate, topicsList }) {
  const { query, setQuery, filters, setFilters, results, loading, clearSearch } = useSearch();
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleTopicClick = (topicId) => {
    onNavigate(topicId);
    onClose();
  };

  const types = [
    { id: null, label: 'All' },
    { id: 'question', label: 'Question', icon: <HelpCircle size={14} /> },
    { id: 'pdf', label: 'PDF', icon: <File size={14} /> },
    { id: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
    { id: 'note', label: 'Note', icon: <FileText size={14} /> },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '80px 20px'
    }}>
      <div 
        className="raised-card"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'white',
          animation: 'modalEnter 0.15s ease-out forwards'
        }}
      >
        {/* Search Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <SearchIcon size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px' }} />
            <input 
              ref={inputRef}
              type="text"
              className="recessed-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, aliases, content..."
              style={{ paddingLeft: '48px', height: '52px', fontSize: '1.1rem' }}
            />
            <button onClick={onClose} style={{
              position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--disabled)'
            }}>
              <X size={20} />
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {types.map(t => (
              <button
                key={t.id}
                onClick={() => setFilters({ ...filters, type: t.id })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '100px',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: filters.type === t.id ? 'var(--accent)' : 'white',
                  color: filters.type === t.id ? 'white' : 'var(--text-secondary)',
                  whiteSpace: 'nowrap'
                }}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
            
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--disabled)' }}>Topic:</span>
              <select 
                value={filters.topic_id || ''}
                onChange={(e) => setFilters({ ...filters, topic_id: e.target.value || null })}
                style={{ 
                  border: 'none', 
                  fontSize: '0.8rem', 
                  color: 'var(--accent)', 
                  fontWeight: 500,
                  outline: 'none',
                  background: 'none'
                }}
              >
                <option value="">Any</option>
                {topicsList?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {!query ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--disabled)' }}>
              <SearchIcon size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>Start typing to search...</p>
            </div>
          ) : loading ? (
            <div style={{ padding: '0 20px' }}>
              {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
            </div>
          ) : results.topics.length === 0 && results.content.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <>
              {results.topics.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ padding: '0 20px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--disabled)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Topics
                  </div>
                  {results.topics.map(topic => (
                    <SearchResultItem 
                      key={topic.id} 
                      type="topic" 
                      item={topic} 
                      onClick={() => handleTopicClick(topic.id)} 
                    />
                  ))}
                </div>
              )}

              {results.content.length > 0 && (
                <div>
                  <div style={{ padding: '0 20px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--disabled)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Content
                  </div>
                  {results.content.map(item => (
                    <SearchResultItem 
                      key={item.id} 
                      type="content" 
                      item={item} 
                      onClick={() => handleTopicClick(item.topic_id)} 
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function SearchResultItem({ type, item, onClick }) {
  const iconConfig = {
    topic: <Folder size={18} color="var(--accent)" />,
    question: <HelpCircle size={18} color="var(--text-secondary)" />,
    pdf: <File size={18} color="var(--text-secondary)" />,
    image: <ImageIcon size={18} color="var(--text-secondary)" />,
    note: <FileText size={18} color="var(--text-secondary)" />,
  };

  const icon = type === 'topic' ? iconConfig.topic : iconConfig[item.type];

  return (
    <div 
      onClick={onClick}
      style={{
        padding: '12px 20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        transition: 'background 100ms ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <div style={{ marginTop: '2px' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent)' }}>
          {type === 'topic' ? item.name : item.title}
        </h4>
        
        {type === 'topic' && item.aliases?.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            {item.aliases.map((a, i) => (
              <span key={i} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--background)', padding: '1px 6px', borderRadius: '4px' }}>
                {a}
              </span>
            ))}
          </div>
        )}

        {type === 'content' && (
          <>
            <p style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-secondary)', 
              display: '-webkit-box', 
              WebkitLineClamp: 1, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden',
              margin: '2px 0'
            }}>
              {item.body || item.file_name || 'No preview available'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--disabled)' }}>
              <span>{item.topics?.name || 'Unknown Topic'}</span>
              <ChevronRight size={12} />
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: '16px', padding: '12px 0' }}>
      <div style={{ width: '20px', height: '20px', backgroundColor: '#eee', borderRadius: '4px' }} className="skeleton-pulse" />
      <div style={{ flex: 1 }}>
        <div style={{ height: '14px', width: '40%', backgroundColor: '#eee', borderRadius: '4px', marginBottom: '8px' }} className="skeleton-pulse" />
        <div style={{ height: '10px', width: '70%', backgroundColor: '#eee', borderRadius: '4px' }} className="skeleton-pulse" />
      </div>
    </div>
  );
}
