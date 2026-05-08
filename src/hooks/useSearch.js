import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ type: null, topic_id: null, dateRange: null });
  const [results, setResults] = useState({ topics: [], content: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const performSearch = useCallback(async (searchQuery) => {
    if (!user || !searchQuery.trim()) {
      setResults({ topics: [], content: [] });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uid = user.id;
      const cleanQuery = searchQuery.trim();

      // 1. Topic name search
      const topicNamePromise = supabase
        .from('topics')
        .select('*')
        .eq('user_id', uid)
        .textSearch('name', cleanQuery, { type: 'websearch' });

      // 2. Alias search
      const aliasPromise = supabase
        .from('topics')
        .select('*')
        .eq('user_id', uid)
        .contains('aliases', [cleanQuery.toLowerCase()]);

      // 3. Content search
      let contentQuery = supabase
        .from('content')
        .select('*, topics(name, parent_id)')
        .eq('user_id', uid)
        .textSearch('title', cleanQuery, { type: 'websearch' });

      // Apply content filters
      if (filters.type) {
        contentQuery = contentQuery.eq('type', filters.type);
      }
      if (filters.topic_id) {
        contentQuery = contentQuery.eq('topic_id', filters.topic_id);
      }

      const [tnResults, aliasResults, contentResults] = await Promise.all([
        topicNamePromise,
        aliasPromise,
        contentQuery
      ]);

      if (tnResults.error) throw tnResults.error;
      if (aliasResults.error) throw aliasResults.error;
      if (contentResults.error) throw contentResults.error;

      // Merge and deduplicate topics
      const allTopics = [...(tnResults.data || []), ...(aliasResults.data || [])];
      const uniqueTopics = Array.from(new Map(allTopics.map(item => [item.id, item])).values());

      setResults({
        topics: uniqueTopics,
        content: contentResults.data || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setResults({ topics: [], content: [] });
  };

  return { 
    query, 
    setQuery, 
    filters, 
    setFilters, 
    results, 
    loading, 
    error, 
    clearSearch 
  };
}
