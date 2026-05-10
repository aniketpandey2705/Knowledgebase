import React, { useState } from 'react';
import { File, Image as ImageIcon, HelpCircle, FileText, ChevronRight, ArrowLeft, Download, ExternalLink, X, Check, MoreHorizontal } from 'lucide-react';
import { formattedDate } from '../../utils/timeUtils';
import { wordCount } from '../../utils/textUtils';
import { useBrowse } from '../../hooks/useBrowse';
import { ContentSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';
import { Lightbox } from '../ui/Lightbox';

export default function BrowseView({ type, onNavigateToTopic, onClose, addQuestionToPDF, selectedQuestions, onOpenModal, flatTopics }) {
  const { content, loading } = useBrowse(type);
  const [expandedPdfId, setExpandedPdfId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const getBreadcrumb = (topicId) => {
    const topic = flatTopics?.find(t => t.id === topicId);
    if (!topic) return '';
    if (topic.parent_id) {
      const parent = flatTopics.find(t => t.id === topic.parent_id);
      if (parent) return `${parent.name} › ${topic.name}`;
    }
    return topic.name;
  };

  const difficultyStyles = {
    Easy: { bg: '#E8F5E9', text: '#2E7D32' },
    Medium: { bg: '#FFF8E1', text: '#F57F17' },
    Hard: { bg: '#FFEBEE', text: '#C62828' }
  };

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
    <div className="topic-detail-container" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <Button variant="outline" onClick={onClose} style={{ width: '40px', padding: 0 }}><ArrowLeft size={20} /></Button>
          <div style={{ color: 'var(--color-accent)' }}>{icon}</div>
          <div>
            <h1 className="topic-title" style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)' }}>{label}</h1>
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
          {content.map(item => {
            const isQuestion = item.type === 'question';
            const isLegacy = isQuestion && !item.option_a;
            const diffStyle = item.difficulty ? difficultyStyles[item.difficulty] : null;
            const isSelected = !!selectedQuestions?.find(q => q.id === item.id);
            const date = formattedDate(item.created_at);

            return (
              <div 
                key={item.id} 
                className="raised-card" 
                style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderLeft: `3px solid ${isQuestion ? (diffStyle?.text || 'var(--color-accent)') : 'var(--color-accent)'}` }}
              >
                {item.type === 'image' ? (
                  <div style={{ position: 'relative' }}>
                    <img src={item.file_url} alt={item.title} onClick={() => setLightboxImage({ url: item.file_url, title: item.title, file_name: item.file_name })} style={{ width: '100%', height: '160px', objectFit: 'cover', cursor: 'zoom-in' }} />
                  </div>
                ) : (
                  <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isQuestion && diffStyle && (
                        <span style={{ backgroundColor: diffStyle.bg, color: diffStyle.text, padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{item.difficulty}</span>
                      )}
                      {isLegacy && (
                        <span style={{ backgroundColor: '#F2F2F7', color: '#AEAEB2', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>Legacy</span>
                      )}
                      {!isQuestion && (
                        <div style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.type === 'pdf' && <FileText size={18} />}
                          {item.type === 'note' && <FileText size={18} />}
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>{item.type}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Button variant="icon" onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}>
                        <MoreHorizontal size={18} />
                      </Button>
                      {activeMenuId === item.id && (
                        <><div onClick={() => setActiveMenuId(null)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
                        <div className="raised-card" style={{ position: 'absolute', top: '100%', right: 0, width: '140px', padding: '6px', zIndex: 11, backgroundColor: 'var(--color-base)' }}>
                          <button onClick={() => { onOpenModal('editContent', item); setActiveMenuId(null); }} className="menu-item">{isLegacy ? 'Upgrade' : 'Edit'}</button>
                          <button onClick={() => { onOpenModal('deleteContent', item); setActiveMenuId(null); }} className="menu-item" style={{ color: 'var(--color-danger)' }}>Delete</button>
                        </div></>
                      )}
                    </div>
                  </div>
                )}

                <div style={{ padding: '16px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {isQuestion ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1C1C1E', lineHeight: '1.5' }}>Q. {item.body}</p>
                      {!isLegacy && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {['a', 'b', 'c', 'd'].map(key => {
                            const optLabel = key.toUpperCase();
                            const isCorrect = item.correct_option === optLabel;
                            return (
                              <div key={key} style={{ fontSize: '0.9rem', color: isCorrect ? '#2E7D32' : '#2C2C2E', fontWeight: isCorrect ? 600 : 400 }}>
                                {isCorrect ? '✓ ' : '  '}{optLabel}. {item[`option_${key}`]}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: '1.3' }}>{item.title}</h3>
                      {item.type === 'pdf' && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{item.file_name}</p>}
                      {item.type === 'note' && <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5', marginTop: '4px' }}>{item.body}</p>}
                    </div>
                  )}

                  {item.type === 'pdf' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="outline" onClick={() => setExpandedPdfId(expandedPdfId === item.id ? null : item.id)} style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }}>{expandedPdfId === item.id ? 'Close' : 'Preview'}</Button>
                        <a href={item.file_url} download style={{ flex: 1, textDecoration: 'none' }}><Button variant="secondary" style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }} icon={Download}>Get</Button></a>
                      </div>
                      {expandedPdfId === item.id && (
                        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                          <iframe src={item.file_url} width="100%" height="300px" style={{ border: 'none' }} title={item.title} />
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: isQuestion ? '1px solid #F2F2F7' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {isQuestion && !isLegacy && <span style={{ fontSize: '12px', color: '#6C6C70' }}>✓ Correct: {item.correct_option}</span>}
                      <div 
                        onClick={() => onNavigateToTopic(item.topic_id, item.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6C6C70', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {getBreadcrumb(item.topic_id)}
                      </div>
                    </div>
                    {isQuestion && (
                      <button
                        onClick={() => addQuestionToPDF(item)}
                        style={{
                          padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          border: isSelected ? 'none' : '1px solid rgba(0,0,0,0.12)',
                          backgroundColor: isSelected ? '#2C2C2E' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : '#2C2C2E',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        {isSelected ? <Check size={14} /> : null}
                        {isSelected ? 'Added' : 'Add to PDF'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />

      <style>{`
        .grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 24px; }
        .menu-item { width: 100%; padding: 8px 10px; border: none; background: none; text-align: left; cursor: pointer; border-radius: 4px; font-size: 13px; transition: background 0.2s; }
        .menu-item:hover { background: #F2F2F7; }
      `}</style>
    </div>
  );
}
