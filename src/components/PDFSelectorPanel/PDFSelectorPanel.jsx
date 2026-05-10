import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown, FileText, Trash2, Check } from 'lucide-react';
import { generatePDF } from '../../utils/generatePDF';
import { useToast } from '../../contexts/ToastContext';

export default function PDFSelectorPanel({
  isOpen,
  onClose,
  selectedQuestions,
  onRemoveQuestion,
  onMoveQuestion,
  onClearAll,
  pdfTitle,
  setPdfTitle,
  includeAnswers,
  setIncludeAnswers,
  generateBoth,
  setGenerateBoth,
  flatTopics
}) {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      generatePDF(selectedQuestions, {
        title: pdfTitle,
        includeAnswers,
        generateBoth
      });
      showToast('PDF downloaded!', 'success');
    } catch (err) {
      showToast('Failed to generate PDF.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

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

  return (
    <div 
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '360px', maxWidth: '100%', backgroundColor: '#FFFFFF',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', zIndex: 300,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 300ms ease', display: 'flex', flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: '1px solid #F2F2F7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '20px', margin: 0 }}>Generate PDF</h2>
          <p style={{ color: '#6C6C70', fontSize: '13px', margin: '4px 0 0' }}>{selectedQuestions.length} questions selected</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AEAEB2' }}><X size={24} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {/* Question List */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Selected Questions</h3>
          
          {selectedQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#6C6C70', fontSize: '13px', margin: 0 }}>No questions selected yet.</p>
              <p style={{ color: '#AEAEB2', fontSize: '12px', marginTop: '8px' }}>Go add questions using the 'Add to PDF' button on any question card.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedQuestions.map((q, i) => {
                const diffStyle = q.difficulty ? difficultyStyles[q.difficulty] : null;
                return (
                  <div key={q.id} style={{ padding: '12px', border: '1px solid #F2F2F7', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button disabled={i === 0} onClick={() => onMoveQuestion(i, 'up')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: i === 0 ? '#F2F2F7' : '#AEAEB2' }}><ChevronUp size={16} /></button>
                      <button disabled={i === selectedQuestions.length - 1} onClick={() => onMoveQuestion(i, 'down')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: i === selectedQuestions.length - 1 ? '#F2F2F7' : '#AEAEB2' }}><ChevronDown size={16} /></button>
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Q{i + 1}. {q.body}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        {diffStyle && (
                          <span style={{ backgroundColor: diffStyle.bg, color: diffStyle.text, padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, fontFamily: 'JetBrains Mono' }}>{q.difficulty}</span>
                        )}
                        <span style={{ fontSize: '11px', color: '#AEAEB2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getBreadcrumb(q.topic_id)}</span>
                      </div>
                    </div>
                    
                    <button onClick={() => onRemoveQuestion(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#AEAEB2', padding: '4px' }}><X size={18} /></button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Options */}
        <div>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#AEAEB2', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>Options</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>Paper Title</label>
              <input 
                type="text" 
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                placeholder="Enter title..."
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #F2F2F7',
                  backgroundColor: '#F9F9F9', fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '13px', fontWeight: 500 }}>Include Answer Key</label>
              <Toggle checked={includeAnswers} onChange={setIncludeAnswers} disabled={generateBoth} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 500, display: 'block' }}>Generate Both Versions</label>
                <span style={{ fontSize: '11px', color: '#AEAEB2' }}>Downloads questions + answers separately</span>
              </div>
              <Toggle checked={generateBoth} onChange={setGenerateBoth} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '24px', borderTop: '1px solid #F2F2F7', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || selectedQuestions.length === 0}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            backgroundColor: '#2C2C2E', color: '#FFFFFF', fontWeight: 600, fontSize: '15px',
            cursor: (isGenerating || selectedQuestions.length === 0) ? 'not-allowed' : 'pointer',
            opacity: (isGenerating || selectedQuestions.length === 0) ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}
        >
          {isGenerating ? <Spinner /> : 'Generate PDF'}
        </button>
        
        <button 
          onClick={onClearAll}
          style={{
            width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #F2F2F7',
            backgroundColor: 'transparent', color: '#2C2C2E', fontWeight: 500, fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Clear All
        </button>
      </div>

      <style>{`
        .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #E9E9EB; transition: .4s; border-radius: 24px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        input:checked + .slider { background-color: #34C759; }
        input:checked + .slider:before { transform: translateX(20px); }
        input:disabled + .slider { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      <span className="slider"></span>
    </label>
  );
}

function Spinner() {
  return (
    <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  );
}
