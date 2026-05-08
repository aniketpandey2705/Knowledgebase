import React, { useEffect, useRef, useState } from 'react';
import { Search as SearchIcon, X, Folder, HelpCircle, File, Image as ImageIcon, FileText, ChevronRight, Clock } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import { Skeleton } from '../ui/Skeleton';

export default function SearchOverlay({ onClose, onNavigate, topicsList }) {
  const { query, setQuery, filters, setFilters, results, loading } = useSearch();
  const inputRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Persistence: Recent Searches
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('kb_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const saveRecentSearch = (q) => {
    if (!q.trim()) return;
    const newRecents = [q.trim(), ...recentSearches.filter(s => s !== q.trim())].slice(0, 5);
    setRecentSearches(newRecents);
    localStorage.setItem('kb_recent_searches', JSON.stringify(newRecents));
  };

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
      if (e.key === 'ArrowUp') setSelectedIndex(prev => Math.max(prev - 1, 0));
      if (e.key === 'Enter' && allResults[selectedIndex]) {
        handleNavigate(allResults[selectedIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedIndex, results]);

  const allResults = [...results.topics.map(t => ({ ...t, _type: 'topic' })), ...results.content.map(c => ({ ...c, _type: 'content' }))];

  const handleNavigate = (item) => {
    saveRecentSearch(query || item.name || item.title);
    onNavigate(item._type === 'topic' ? item.id : item.topic_id);
    onClose();
  };

  const highlightMatch = (text, q) => {
    if (!q.trim()) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === q.toLowerCase() ? <strong key={i} style={{ color: 'var(--color-accent)' }}>{part}</strong> : part
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px' }}>
      <div className="raised-card" style={{ width: '100%', maxWidth: '640px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'modalEnter 0.15s ease-out forwards' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <SearchIcon size={20} color="var(--color-text-secondary)" style={{ position: 'absolute', left: '16px' }} />
            <input 
              ref={inputRef} type="text" className="recessed-input" value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              placeholder="Search topics, aliases, content..."
              style={{ paddingLeft: '48px', height: '52px', fontSize: '1.1rem' }}
            />
            <button onClick={onClose} style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-disabled)' }}><X size={20} /></button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {!query && recentSearches.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ padding: '0 20px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-disabled)', textTransform: 'uppercase' }}>Recent</div>
              {recentSearches.map((s, i) => (
                <div key={i} onClick={() => setQuery(s)} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <Clock size={14} /> {s}
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '0 20px' }}><Skeleton width="40%" height="14px" /><Skeleton width="100%" height="40px" /></div>
          ) : allResults.length === 0 && query ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>No results for "{query}"</div>
          ) : (
            allResults.map((item, i) => (
              <SearchResultItem 
                key={item.id} 
                item={item} 
                isSelected={i === selectedIndex}
                query={query}
                onClick={() => handleNavigate(item)} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultItem({ item, isSelected, query, onClick }) {
  const icon = item._type === 'topic' ? <Folder size={18} /> : (item.type === 'pdf' ? <File size={18} /> : <ImageIcon size={18} />);
  
  return (
    <div 
      onClick={onClick}
      style={{
        padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '16px',
        backgroundColor: isSelected ? 'var(--color-bg)' : 'transparent',
        borderLeft: isSelected ? '3px solid var(--color-accent)' : '3px solid transparent'
      }}
    >
      <div style={{ marginTop: '2px', color: isSelected ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
          {highlightMatch(item._type === 'topic' ? item.name : item.title, query)}
        </h4>
        {item._type === 'content' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-text-disabled)' }}>
            <span>{item.topics?.name}</span> <ChevronRight size={12} /> <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );

  function highlightMatch(text, q) {
    if (!q.trim()) return text;
    const parts = text.split(new RegExp(`(${q})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === q.toLowerCase() ? <strong key={i} style={{ color: 'var(--color-accent)' }}>{part}</strong> : part
    );
  }
}
