import { useState, useCallback } from 'react';

export function useRecentTopics() {
  const getRecent = useCallback((topicsList = []) => {
    const saved = localStorage.getItem('kb_recent_topics');
    if (!saved) return [];
    
    let recent = JSON.parse(saved);
    
    // Filter out deleted topics by checking against the current topicsList
    // Note: topicsList is the flat list of all topics
    const flatTopicsIds = topicsList.map(t => t.id);
    recent = recent.filter(t => flatTopicsIds.includes(t.id));
    
    // Sync back if some were filtered
    if (recent.length !== JSON.parse(saved).length) {
      localStorage.setItem('kb_recent_topics', JSON.stringify(recent));
    }
    
    return recent.sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  const addRecent = useCallback((topic) => {
    if (!topic || !topic.id) return;
    
    const saved = localStorage.getItem('kb_recent_topics');
    let recent = saved ? JSON.parse(saved) : [];
    
    // Remove if already exists to move to top
    recent = recent.filter(t => t.id !== topic.id);
    
    // Add to start
    recent.unshift({
      id: topic.id,
      name: topic.name,
      timestamp: Date.now()
    });
    
    // Keep last 5
    recent = recent.slice(0, 5);
    
    localStorage.setItem('kb_recent_topics', JSON.stringify(recent));
  }, []);

  const clearRecent = useCallback(() => {
    localStorage.removeItem('kb_recent_topics');
  }, []);

  return { addRecent, getRecent, clearRecent };
}
