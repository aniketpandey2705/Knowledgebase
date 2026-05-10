import React, { useState, useEffect } from 'react';
import { Folder, ChevronRight, Plus, File, Image as ImageIcon, HelpCircle, FileText, LogOut, User, Menu, MoreVertical } from 'lucide-react';
import { formattedDate } from '../../utils/timeUtils';
import { SidebarSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';

export default function Sidebar({ 
  topics, 
  loading,
  selectedTopicId, 
  onSelectTopic, 
  onOpenModal, 
  user, 
  onLogout,
  browseType,
  onSelectBrowse,
  contentCountMap = {},
  isOpen,
  onClose
}) {

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

      <aside 
        style={{
          width: '260px', height: '100vh', position: 'fixed', left: 0, top: 0,
          backgroundColor: 'var(--color-base)', borderRight: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column', zIndex: 200,
          transition: 'transform 250ms ease-in-out'
        }}
        className={`sidebar-container ${isOpen ? 'mobile-show' : ''}`}
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

        <div style={{ padding: '0 20px', marginBottom: '24px' }}>
          <p className="form-label" style={{ fontSize: '10px', marginBottom: '12px' }}>Browse</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <BrowseRow icon={<File size={16} />} label="All PDFs" active={browseType === 'pdf'} onClick={() => onSelectBrowse('pdf')} />
            <BrowseRow icon={<ImageIcon size={16} />} label="All Images" active={browseType === 'image'} onClick={() => onSelectBrowse('image')} />
            <BrowseRow icon={<HelpCircle size={16} />} label="All Questions" active={browseType === 'question'} onClick={() => onSelectBrowse('question')} />
            <BrowseRow icon={<FileText size={16} />} label="All Notes" active={browseType === 'note'} onClick={() => onSelectBrowse('note')} />
          </div>
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
                onSelectTopic={(id) => { onSelectTopic(id); onClose(); }}
                onOpenModal={onOpenModal}
                contentCountMap={contentCountMap}
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
          <Button variant="icon" onClick={onLogout}>
            <LogOut size={18} />
          </Button>
        </div>
      </aside>

      <style>{`
        .sidebar-topic-row { position: relative; }
        .sidebar-topic-row:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 12px;
          background: #333;
          color: white;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          z-index: 100;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s 0.5s, visibility 0.2s 0.5s;
        }
        .sidebar-topic-row:hover:after {
          opacity: 1;
          visibility: visible;
        }
      `}</style>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 199 }}
        />
      )}
    </>
  );
}

function BrowseRow({ icon, label, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="btn-active-effect browse-row"
      style={{
        height: '44px', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '0 12px', cursor: 'pointer', borderRadius: '8px',
        backgroundColor: active ? 'var(--color-accent)' : 'transparent',
        color: active ? 'white' : 'var(--color-accent)', fontSize: '0.9rem'
      }}
    >
      {icon} <span>{label}</span>
    </div>
  );
}

function TopicNode({ topic, level, selectedTopicId, expandedIds, onToggleExpand, onSelectTopic, onOpenModal, contentCountMap }) {
  const isExpanded = expandedIds.includes(topic.id);
  const isActive = selectedTopicId === topic.id;
  const count = contentCountMap[topic.id] || 0;
  const lastUpdatedStr = formattedDate(topic.updated_at);

  return (
    <div style={{ marginBottom: '2px' }}>
      <div 
        className="sidebar-topic-row btn-active-effect"
        data-tooltip={topic.updated_at ? `Last updated: ${lastUpdatedStr}` : ''}
        style={{
          height: '44px', display: 'flex', alignItems: 'center', gap: '8px',
          padding: `0 12px 0 ${level * 16 + 12}px`, cursor: 'pointer', borderRadius: '8px',
          backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
          color: isActive ? 'white' : 'var(--color-text-secondary)',
          fontSize: '0.9rem', transition: 'all 150ms ease'
        }}
        onClick={() => onSelectTopic(topic.id)}
      >
        <div onClick={(e) => { e.stopPropagation(); onToggleExpand(topic.id); }} style={{ display: 'flex', alignItems: 'center' }}>
          {topic.children?.length > 0 ? (
            <ChevronRight size={14} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          ) : <div style={{ width: 14 }} />}
        </div>
        <Folder size={16} />
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{topic.name}</span>
        
        {count > 0 && (
          <span style={{ 
            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#F2F2F7', 
            color: isActive ? 'white' : '#6C6C70', 
            fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '100px' 
          }}>
            {count}
          </span>
        )}

        <Button 
          variant="icon"
          onClick={(e) => { e.stopPropagation(); onOpenModal('editTopic', topic); }}
          style={{ color: isActive ? 'white' : 'var(--color-text-secondary)' }}
        >
          <MoreVertical size={14} />
        </Button>
      </div>

      {isExpanded && topic.children?.map(child => (
        <TopicNode 
          key={child.id} 
          topic={child} 
          level={level + 1}
          selectedTopicId={selectedTopicId}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
          onSelectTopic={onSelectTopic}
          onOpenModal={onOpenModal}
          contentCountMap={contentCountMap}
        />
      ))}
    </div>
  );
}
