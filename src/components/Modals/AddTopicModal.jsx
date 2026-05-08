import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';

export default function AddTopicModal({ 
  topicToEdit, 
  topics, 
  onSave, 
  onClose,
  loading 
}) {
  const [name, setName] = useState('');
  const [aliases, setAliases] = useState([]);
  const [aliasInput, setAliasInput] = useState('');
  const [parentId, setParentId] = useState('');
  const [icon, setIcon] = useState('📁');

  useEffect(() => {
    if (topicToEdit) {
      setName(topicToEdit.name || '');
      setAliases(topicToEdit.aliases || []);
      setParentId(topicToEdit.parent_id || '');
      setIcon(topicToEdit.icon || '📁');
    }
  }, [topicToEdit]);

  const handleAddAlias = (e) => {
    if (e.key === 'Enter' && aliasInput.trim()) {
      e.preventDefault();
      if (!aliases.includes(aliasInput.trim())) {
        setAliases([...aliases, aliasInput.trim()]);
      }
      setAliasInput('');
    }
  };

  const removeAlias = (index) => {
    setAliases(aliases.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSave({
      name: name.trim(),
      aliases,
      parent_id: parentId || null,
      icon
    });
  };

  // Flatten topics for the dropdown (simple version)
  const flatTopics = [];
  const flatten = (items, depth = 0) => {
    items.forEach(item => {
      if (topicToEdit && item.id === topicToEdit.id) return; // Can't parent to self
      flatTopics.push({ ...item, depth });
      if (item.children) flatten(item.children, depth + 1);
    });
  };
  flatten(topics);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="raised-card" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '32px',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '1.5rem', 
          marginBottom: '24px' 
        }}>
          {topicToEdit ? 'Edit Topic' : 'Add New Topic'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Topic Name</label>
            <input 
              type="text"
              required
              className="recessed-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Algorithms"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Aliases (Press Enter to add)</label>
            <div className="recessed-input" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px' }}>
              {aliases.map((alias, i) => (
                <span key={i} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  {alias}
                  <X size={12} onClick={() => removeAlias(i)} style={{ cursor: 'pointer' }} />
                </span>
              ))}
              <input 
                type="text"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                onKeyDown={handleAddAlias}
                placeholder={aliases.length === 0 ? "algo, dsa..." : ""}
                style={{ 
                  border: 'none', 
                  outline: 'none', 
                  background: 'transparent',
                  flex: 1,
                  minWidth: '60px'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Parent Topic (Optional)</label>
            <select 
              className="recessed-input"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">No Parent (Root)</option>
              {flatTopics.map(t => (
                <option key={t.id} value={t.id}>
                  {'\u00A0'.repeat(t.depth * 3)} {t.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="primary-button"
              style={{ backgroundColor: 'var(--disabled)', background: 'var(--disabled)', flex: 1 }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Saving...' : (topicToEdit ? 'Save Changes' : 'Create Topic')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
