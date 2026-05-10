import { useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function useContent(topicId) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const fetchContent = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getContentByTopic(id);
      setContent(data);
    } catch (err) {
      showToast('Failed to load content.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    setContent([]);
    if (!topicId) return;
    fetchContent(topicId);
  }, [topicId, fetchContent]);

  const addContent = async (contentData) => {
    const tempId = Date.now().toString();
    const optimisticItem = { ...contentData, id: tempId, created_at: new Date().toISOString() };
    
    const previous = [...content];
    setContent([optimisticItem, ...previous]);

    try {
      const saved = await api.createContent({ ...contentData, user_id: user.id });
      // Only keep in local state if it belongs to current topic
      if (saved.topic_id === topicId) {
        setContent(prev => prev.map(item => item.id === tempId ? saved : item));
      } else {
        setContent(prev => prev.filter(item => item.id !== tempId));
      }
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
      const updated = await api.updateContent(id, updates, previous.find(c => c.id === id)?.topic_id);
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
      await api.deleteContent(id, storagePath, previous.find(c => c.id === id)?.topic_id);
    } catch (err) {
      setContent(previous);
      showToast('Failed to delete.', 'error');
      throw err;
    }
  };

  return { content, loading, fetchContent: () => fetchContent(topicId), addContent, editContent, deleteContent };
}
