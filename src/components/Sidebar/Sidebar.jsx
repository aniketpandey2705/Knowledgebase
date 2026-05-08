import React, { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, MoreVertical, Folder, LogOut, User } from 'lucide-react';

export default function Sidebar({ 
  topics, 
  selectedTopicId, 
  onSelectTopic, 
  onOpenModal, 
  user, 
  onLogout 
}) {
  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: 'var(--base)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      {/* Header */}
      <div style={{ padding: '24px 20px' }}>
        <h1 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '1.5rem', 
          marginBottom: '20px',
          color: 'var(--accent)'
        }}>
          KnowledgeBase
        </h1>
        
        <button 
          onClick={() => onOpenModal('addTopic')}
          className="primary-button"
          style={{ 
            height: '40px', 
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} />
          New Topic
        </button>
      </div>

      {/* Topic Tree */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '0 12px' 
      }}>
        {topics.length === 0 ? (
          <p style={{ 
            fontSize: '0.85rem', 
            color: 'var(--text-secondary)', 
            textAlign: 'center',
            marginTop: '20px'
          }}>
            No topics yet.
          </p>
        ) : (
          topics.map(topic => (
            <TopicNode 
              key={topic.id} 
              topic={topic} 
              level={0}
              selectedTopicId={selectedTopicId}
              onSelectTopic={onSelectTopic}
              onOpenModal={onOpenModal}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ 
        padding: '16px 20px', 
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)'
        }}>
          <User size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ 
            fontSize: '0.85rem', 
            fontWeight: 500, 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis' 
          }}>
            {user?.user_metadata?.name || user?.email?.split('@')[0]}
          </p>
        </div>
        <button 
          onClick={onLogout}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

function TopicNode({ topic, level, selectedTopicId, onSelectTopic, onOpenModal }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const hasChildren = topic.children && topic.children.length > 0;
  const isActive = selectedTopicId === topic.id;

  return (
    <div style={{ position: 'relative' }}>
      {/* Topic Row */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelectTopic(topic.id)}
        style={{
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          padding: `0 8px 0 ${level * 16 + 8}px`,
          cursor: 'pointer',
          borderRadius: '8px',
          backgroundColor: isActive ? 'var(--accent)' : (isHovered ? 'var(--background)' : 'transparent'),
          color: isActive ? 'white' : 'var(--accent)',
          fontSize: '0.9rem',
          transition: 'all 150ms ease',
          marginBottom: '2px',
          position: 'relative'
        }}
      >
        {/* Vertical Connector Line */}
        {level > 0 && (
          <div style={{
            position: 'absolute',
            left: `${(level - 1) * 16 + 16}px`,
            top: '-18px',
            bottom: '18px',
            width: '1px',
            backgroundColor: '#E5E5EA'
          }} />
        )}

        {/* Expand/Collapse Arrow */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          style={{ 
            width: '20px', 
            display: 'flex', 
            alignItems: 'center',
            visibility: hasChildren ? 'visible' : 'hidden'
          }}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>

        {/* Icon & Name */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          flex: 1,
          minWidth: 0
        }}>
          <span style={{ fontSize: '1.1rem' }}>{topic.icon || '📁'}</span>
          <span style={{ 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis' 
          }}>
            {topic.name}
          </span>
        </div>

        {/* Actions Menu */}
        {isHovered && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              // In a real app we'd show a dropdown. Here we'll just trigger the edit modal.
              onOpenModal('editTopic', topic);
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: isActive ? 'white' : 'var(--text-secondary)' 
            }}
          >
            <MoreVertical size={14} />
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div style={{ marginBottom: '4px' }}>
          {topic.children.map(child => (
            <TopicNode 
              key={child.id} 
              topic={child} 
              level={level + 1}
              selectedTopicId={selectedTopicId}
              onSelectTopic={onSelectTopic}
              onOpenModal={onOpenModal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
