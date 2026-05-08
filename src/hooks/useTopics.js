import { useState, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const buildTree = (items, parentId = null) => {
  return items
    .filter(item => item.parent_id === parentId)
    .map(item => ({
      ...item,
      children: buildTree(items, item.id)
    }));
};

export function useTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Cache ref to avoid redundant fetches
  const cache = useRef(null);

  const fetchTopics = useCallback(async (force = false) => {
    if (!user) return;
    if (!force && cache.current) {
      setTopics(buildTree(cache.current));
      return;
    }

    setLoading(true);
    try {
      const data = await api.getTopics(user.id);
      cache.current = data;
      setTopics(buildTree(data));
    } catch (err) {
      showToast('Failed to load topics. Check your internet.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  const addTopic = async (topicData) => {
    const tempId = Date.now().toString();
    const optimisticTopic = { ...topicData, id: tempId, user_id: user.id, created_at: new Date().toISOString() };
    
    // Optimistic Update
    const previousCache = [...(cache.current || [])];
    const newCache = [...previousCache, optimisticTopic];
    cache.current = newCache;
    setTopics(buildTree(newCache));

    try {
      const savedTopic = await api.createTopic({ ...topicData, user_id: user.id });
      // Replace temp with real
      cache.current = previousCache.map(t => t.id === tempId ? savedTopic : t);
      cache.current = [...previousCache, savedTopic];
      setTopics(buildTree(cache.current));
      return savedTopic;
    } catch (err) {
      // Rollback
      cache.current = previousCache;
      setTopics(buildTree(previousCache));
      showToast('Failed to add topic. Try again.', 'error');
      throw err;
    }
  };

  const editTopic = async (id, updates) => {
    const previousCache = [...(cache.current || [])];
    const newCache = previousCache.map(t => t.id === id ? { ...t, ...updates } : t);
    cache.current = newCache;
    setTopics(buildTree(newCache));

    try {
      const updated = await api.updateTopic(id, updates);
      cache.current = previousCache.map(t => t.id === id ? updated : t);
    } catch (err) {
      cache.current = previousCache;
      setTopics(buildTree(previousCache));
      showToast('Failed to update topic.', 'error');
      throw err;
    }
  };

  const deleteTopic = async (id) => {
    const previousCache = [...(cache.current || [])];
    const newCache = previousCache.filter(t => t.id !== id);
    cache.current = newCache;
    setTopics(buildTree(newCache));

    try {
      await api.deleteTopic(id);
      showToast('Topic deleted.', 'success');
    } catch (err) {
      cache.current = previousCache;
      setTopics(buildTree(previousCache));
      showToast('Failed to delete topic.', 'error');
      throw err;
    }
  };

  return { topics, loading, fetchTopics, addTopic, editTopic, deleteTopic };
}
