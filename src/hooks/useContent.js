import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function useContent() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchContent = useCallback(async (topicId) => {
    if (!topicId) return;
    setLoading(true);
    try {
      const data = await api.getContentByTopic(topicId);
      setContent(data);
    } catch (err) {
      showToast('Failed to load content.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const addContent = async (contentData) => {
    const tempId = Date.now().toString();
    const optimisticItem = { ...contentData, id: tempId, created_at: new Date().toISOString() };
    
    const previous = [...content];
    setContent([optimisticItem, ...previous]);

    try {
      const saved = await api.createContent({ ...contentData, user_id: user.id });
      setContent(prev => prev.map(item => item.id === tempId ? saved : item));
      return saved;
    } catch (err) {
      setContent(previous);
      showToast('Failed to add content.', 'error');
      throw err;
    }
  };

  const editContent = async (id, updates) => {
    const previous = [...content];
    setContent(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));

    try {
      const updated = await api.updateContent(id, updates);
      setContent(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err) {
      setContent(previous);
      showToast('Failed to update.', 'error');
      throw err;
    }
  };

  const deleteContent = async (id, storagePath = null) => {
    const previous = [...content];
    setContent(prev => prev.filter(item => item.id !== id));

    try {
      await api.deleteContent(id, storagePath);
    } catch (err) {
      setContent(previous);
      showToast('Failed to delete.', 'error');
      throw err;
    }
  };

  return { content, loading, fetchContent, addContent, editContent, deleteContent };
}
