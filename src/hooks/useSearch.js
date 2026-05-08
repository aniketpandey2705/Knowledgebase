import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    type: null,
    topic_id: null,
    dateRange: null,
    tag: null
  });
  const [results, setResults] = useState({ topics: [], content: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ topics: [], content: [] });
      return;
    }
    const timer = setTimeout(() => {
      runSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [query, filters]);

  async function runSearch() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Search topic names
      const { data: topicNameResults, error: tnErr } = await supabase
        .from('topics')
        .select('*')
        .eq('user_id', user.id)
        .ilike('name', `%${query}%`);
      if (tnErr) throw tnErr;

      // 2. Search topic aliases
      const { data: topicAliasResults, error: taErr } = await supabase
        .from('topics')
        .select('*')
        .eq('user_id', user.id)
        .contains('aliases', [query.toLowerCase()]);
      if (taErr) throw taErr;

      // 3. Search content title + body
      let contentQuery = supabase
        .from('content')
        .select('*, topics(name)')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,body.ilike.%${query}%`);

      if (filters.type) contentQuery = contentQuery.eq('type', filters.type);
      if (filters.topic_id) contentQuery = contentQuery.eq('topic_id', filters.topic_id);
      if (filters.tag) contentQuery = contentQuery.contains('tags', [filters.tag]);

      const { data: contentResults, error: cErr } = await contentQuery;
      if (cErr) throw cErr;

      // Merge + deduplicate topics
      const allTopics = [...(topicNameResults || []), ...(topicAliasResults || [])];
      const uniqueTopics = allTopics.filter(
        (t, i, self) => self.findIndex(x => x.id === t.id) === i
      );

      setResults({
        topics: uniqueTopics,
        content: contentResults || []
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const clearSearch = () => {
    setQuery('');
    setResults({ topics: [], content: [] });
  };

  const fetchUniqueTags = useCallback(async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from('content')
        .select('tags')
        .eq('user_id', user.id);
      if (error) throw error;
      
      const allTags = data.flatMap(item => item.tags || []);
      return Array.from(new Set(allTags)).sort();
    } catch (err) {
      console.error("Error fetching tags", err);
      return [];
    }
  }, [user]);

  return { 
    query, 
    setQuery, 
    filters, 
    setFilters, 
    results, 
    loading, 
    error, 
    clearSearch,
    fetchUniqueTags
  };
}
