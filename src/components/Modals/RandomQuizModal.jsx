import React, { useState, useEffect } from 'react';
import { Shuffle, X, AlertTriangle } from 'lucide-react';
import ModalBase from '../ui/ModalBase';
import { Button } from '../ui/Button';

export default function RandomQuizModal({
  allQuestions,
  topics,
  selectedTopicId,
  onGenerate,
  onClose
}) {
  const [selectedDifficulties, setSelectedDifficulties] = useState(['Easy', 'Medium', 'Hard']);
  const [source, setSource] = useState('all'); // 'current' | 'all' | 'specific'
  const [specificTopicId, setSpecificTopicId] = useState(topics?.[0]?.id || null);
  const [count, setCount] = useState(10);
  const [customCount, setCustomCount] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [availableCount, setAvailableCount] = useState(0);

  const toggleDifficulty = (level) => {
    setSelectedDifficulties(prev =>
      prev.includes(level)
        ? prev.filter(d => d !== level)
        : [...prev, level]
    );
  };

  useEffect(() => {
    let pool = allQuestions || [];
    
    if (source === 'current' && selectedTopicId) {
      pool = pool.filter(q => q.topic_id === selectedTopicId);
    } else if (source === 'specific' && specificTopicId) {
      pool = pool.filter(q => q.topic_id === specificTopicId);
    }
    
    if (selectedDifficulties.length > 0) {
      pool = pool.filter(q => selectedDifficulties.includes(q.difficulty));
    } else {
      pool = [];
    }
    
    setAvailableCount(pool.length);
  }, [selectedDifficulties, source, specificTopicId, allQuestions, selectedTopicId]);

  useEffect(() => {
    if (source === 'current' && selectedTopicId) {
      const topic = topics.find(t => t.id === selectedTopicId);
      if (topic) setQuizTitle(`${topic.name} Practice`);
    } else if (source === 'all') {
      setQuizTitle('General Practice Quiz');
    }
  }, [source, selectedTopicId, topics]);

  const handleGenerate = () => {
    if (selectedDifficulties.length === 0) return;

    let pool = allQuestions || [];
    if (source === 'current' && selectedTopicId) {
      pool = pool.filter(q => q.topic_id === selectedTopicId);
    } else if (source === 'specific' && specificTopicId) {
      pool = pool.filter(q => q.topic_id === specificTopicId);
    }
    pool = pool.filter(q => selectedDifficulties.includes(q.difficulty));

    const actualCount = count === 'custom' ? parseInt(customCount) || 0 : count;
    const finalCount = Math.min(actualCount, pool.length);

    function shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    const selected = shuffle(pool).slice(0, finalCount);
    onGenerate(selected, quizTitle);
  };

  const difficultyStyles = {
    Easy: { bg: '#E8F5E9', text: '#2E7D32', border: '#2E7D32' },
    Medium: { bg: '#FFF8E1', text: '#F57F17', border: '#F57F17' },
    Hard: { bg: '#FFEBEE', text: '#C62828', border: '#C62828' }
  };

  const actualCount = count === 'custom' ? parseInt(customCount) || 0 : count;
  const isOverCount = actualCount > availableCount && availableCount > 0;

  return (
    <ModalBase onClose={onClose}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <header style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-accent)', marginBottom: '8px' }}>
            <Shuffle size={20} />
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', margin: 0 }}>Random Quiz Generator</h2>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>Auto-select questions by difficulty</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Difficulty */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Difficulty</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Easy', 'Medium', 'Hard'].map(level => {
                const isSelected = selectedDifficulties.includes(level);
                const style = isSelected ? difficultyStyles[level] : { bg: '#F2F2F7', text: '#AEAEB2', border: 'transparent' };
                return (
                  <button
                    key={level}
                    onClick={() => toggleDifficulty(level)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '100px', fontSize: '13px', fontWeight: 600,
                      backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}`,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
            {selectedDifficulties.length === 0 && <p style={{ fontSize: '11px', color: 'var(--color-danger)', marginTop: '8px' }}>Please select at least one difficulty.</p>}
          </div>

          {/* Source */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>From</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {[
                { id: 'all', label: 'All Topics' },
                { id: 'current', label: 'Current Topic', disabled: !selectedTopicId },
                { id: 'specific', label: 'Specific Topic' }
              ].map(opt => (
                <button
                  key={opt.id}
                  disabled={opt.disabled}
                  onClick={() => setSource(opt.id)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '100px', fontSize: '12px', fontWeight: 500,
                    backgroundColor: source === opt.id ? '#2C2C2E' : '#F2F2F7',
                    color: source === opt.id ? '#FFFFFF' : '#6C6C70',
                    border: 'none', cursor: opt.disabled ? 'not-allowed' : 'pointer',
                    opacity: opt.disabled ? 0.4 : 1, transition: 'all 0.2s'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {source === 'specific' && (
              <select
                value={specificTopicId || ''}
                onChange={(e) => setSpecificTopicId(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #F2F2F7',
                  backgroundColor: '#F9F9F9', fontSize: '14px', appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23AEAEB2\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center'
                }}
              >
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
          </div>

          {/* Number of Questions */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Number of Questions</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {[5, 10, 15, 20, 'custom'].map(num => (
                <button
                  key={num}
                  onClick={() => setCount(num)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
                    backgroundColor: count === num ? '#2C2C2E' : '#F2F2F7',
                    color: count === num ? '#FFFFFF' : '#6C6C70',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {num === 'custom' ? 'Custom' : num}
                </button>
              ))}
            </div>

            {count === 'custom' && (
              <input
                type="number"
                min="1" max="100"
                value={customCount}
                onChange={(e) => setCustomCount(e.target.value)}
                placeholder="How many questions?"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #F2F2F7',
                  backgroundColor: '#F9F9F9', fontSize: '14px', marginBottom: '12px'
                }}
              />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <p style={{ fontSize: '12px', color: '#6C6C70', margin: 0 }}>
                {availableCount} questions available with selected filters
              </p>
              {isOverCount && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F57F17' }}>
                  <AlertTriangle size={12} />
                  <span style={{ fontSize: '11px', fontWeight: 500 }}>Only {availableCount} available — will use all.</span>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#AEAEB2', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>Paper Title (optional)</label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g. Practice Test"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #F2F2F7',
                backgroundColor: '#F9F9F9', fontSize: '14px'
              }}
            />
          </div>
        </div>

        <footer style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button
            onClick={handleGenerate}
            disabled={selectedDifficulties.length === 0 || availableCount === 0}
            style={{ flex: 2 }}
          >
            Generate
          </Button>
        </footer>
      </div>
    </ModalBase>
  );
}
