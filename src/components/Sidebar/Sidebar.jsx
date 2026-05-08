import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, ChevronDown, MoreVertical, LogOut, User, Menu } from 'lucide-react';
import { SidebarSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';

export default function Sidebar({ 
  topics, 
  loading,
  selectedTopicId, 
  onSelectTopic, 
  onOpenModal, 
  user, 
  onLogout 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Persistence: Restore expanded state from localStorage
  const [expandedIds, setExpandedIds] = useState(() => {
    const saved = localStorage.getItem('kb_expanded_topics');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kb_expanded_topics', JSON.stringify(expandedIds));
  }, [expandedIds]);

  const toggleExpand = (id) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <>
      {/* Mobile Hamburger */}
      <button 
        className="btn-active-effect"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          position: 'fixed', top: '12px', left: '12px', zIndex: 1001,
          display: 'none', // Overridden by media query in index.css
          padding: '8px', background: 'var(--color-base)', borderRadius: '8px', border: '1px solid var(--color-border)'
        }}
      >
        <Menu size={24} />
      </button>

      <aside 
        className={`${isMobileMenuOpen ? 'mobile-show' : 'mobile-hide'}`}
        style={{
          width: '260px', height: '100vh', position: 'fixed', left: 0, top: 0,
          backgroundColor: 'var(--color-base)', borderRight: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column', zIndex: 1000,
          transition: 'transform 0.3s ease'
        }}
      >
        <div style={{ padding: '24px 20px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '20px' }}>
            KnowledgeBase
          </h1>
          
          <Button 
            onClick={() => onOpenModal('addTopic')} 
            icon={Plus} 
            style={{ width: '100%' }}
          >
            New Topic
          </Button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {loading ? (
            <SidebarSkeleton />
          ) : topics.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: '20px' }}>
              No topics yet.
            </p>
          ) : (
            topics.map(topic => (
              <TopicNode 
                key={topic.id} 
                topic={topic} 
                level={0}
                selectedTopicId={selectedTopicId}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                onSelectTopic={(id) => { onSelectTopic(id); setIsMobileMenuOpen(false); }}
                onOpenModal={onOpenModal}
              />
            ))
          )}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '16px', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.user_metadata?.name || user?.email?.split('@')[0]}
            </p>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999 }}
        />
      )}
    </>
  );
}

function TopicNode({ topic, level, selectedTopicId, expandedIds, onToggleExpand, onSelectTopic, onOpenModal }) {
  const isExpanded = expandedIds.includes(topic.id);
  const isActive = selectedTopicId === topic.id;
  const hasChildren = topic.children && topic.children.length > 0;

  return (
    <div style={{ position: 'relative' }}>
      <div 
        onClick={() => onSelectTopic(topic.id)}
        className="btn-active-effect"
        style={{
          height: '36px', display: 'flex', alignItems: 'center',
          padding: `0 8px 0 ${level * 16 + 8}px`, cursor: 'pointer', borderRadius: '8px',
          backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
          color: isActive ? 'white' : 'var(--color-accent)', fontSize: '0.9rem', marginBottom: '2px'
        }}
      >
        <div 
          onClick={(e) => { e.stopPropagation(); onToggleExpand(topic.id); }}
          style={{ width: '20px', visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <span>{topic.icon || '📁'}</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topic.name}</span>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onOpenModal('editTopic', topic); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isActive ? 'white' : 'var(--color-text-secondary)' }}
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {topic.children.map(child => (
            <TopicNode 
              key={child.id} 
              topic={child} 
              level={level + 1}
              selectedTopicId={selectedTopicId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onSelectTopic={onSelectTopic}
              onOpenModal={onOpenModal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
