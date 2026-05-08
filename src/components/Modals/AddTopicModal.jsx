import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import ModalBase from '../ui/ModalBase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export default function AddTopicModal({ topicToEdit, topics, onSave, onClose, loading }) {
  const [name, setName] = useState('');
  const [aliases, setAliases] = useState([]);
  const [aliasInput, setAliasInput] = useState('');
  const [parentId, setParentId] = useState('');
  const [icon, setIcon] = useState('📁');
  const [error, setError] = useState('');
  
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
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
      const val = aliasInput.trim().toLowerCase();
      if (val.length > 30) return;
      if (aliases.length >= 10) return;
      if (!aliases.includes(val)) {
        setAliases([...aliases, val]);
      }
      setAliasInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Topic name is required');
      return;
    }
    if (name.length > 100) {
      setError('Name too long (max 100)');
      return;
    }
    
    onSave({ name: name.trim(), aliases, parent_id: parentId || null, icon });
  };

  const flatTopics = [];
  const flatten = (items, depth = 0) => {
    items.forEach(item => {
      if (topicToEdit && item.id === topicToEdit.id) return;
      flatTopics.push({ ...item, depth });
      if (item.children) flatten(item.children, depth + 1);
    });
  };
  flatten(topics);

  const hasUnsavedChanges = name.trim() !== (topicToEdit?.name || '');

  return (
    <ModalBase 
      title={topicToEdit ? 'Edit Topic' : 'Add New Topic'} 
      onClose={onClose}
      hasUnsavedChanges={hasUnsavedChanges}
    >
      <form onSubmit={handleSubmit} onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && handleSubmit(e)}>
        <Input 
          ref={nameRef}
          label="Topic Name"
          required
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          error={error}
          placeholder="e.g. Algorithms"
        />

        <div className="form-group">
          <label className="form-label">Aliases (Enter to add)</label>
          <div className="recessed-input" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px' }}>
            {aliases.map((alias, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-accent)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                {alias} <X size={12} onClick={() => setAliases(aliases.filter((_, idx) => idx !== i))} style={{ cursor: 'pointer' }} />
              </span>
            ))}
            <input 
              type="text" value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              onKeyDown={handleAddAlias}
              placeholder={aliases.length === 0 ? "algo, dsa..." : ""}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, minWidth: '60px' }}
            />
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Max 10 aliases, 30 chars each.</p>
        </div>

        <div className="form-group">
          <label className="form-label">Parent Topic</label>
          <select className="recessed-input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">No Parent (Root)</option>
            {flatTopics.map(t => (
              <option key={t.id} value={t.id}>{'\u00A0'.repeat(t.depth * 3)} {t.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button type="submit" loading={loading} style={{ flex: 1 }}>
            {topicToEdit ? 'Save Changes' : 'Create Topic'}
          </Button>
        </div>
      </form>
    </ModalBase>
  );
}
