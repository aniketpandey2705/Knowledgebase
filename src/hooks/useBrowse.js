import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const browseCache = new Map();

export function useBrowse(type, refreshKey) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchBrowse = useCallback(async (force = false) => {
    if (!user || !type) return;

    if (!force && browseCache.has(type)) {
      setContent(browseCache.get(type));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from('content')
        .select('*, topics(name, parent_id)')
        .eq('user_id', user.id)
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      setContent(data || []);
      browseCache.set(type, data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, type]);

  useEffect(() => {
    if (refreshKey) {
      browseCache.delete(type);
    }
    fetchBrowse();
  }, [type, refreshKey, fetchBrowse]);

  // Clear cache for a specific type or all
  const invalidateCache = (targetType) => {
    if (targetType) browseCache.delete(targetType);
    else browseCache.clear();
  };

  return { content, loading, error, refetch: () => fetchBrowse(true), invalidateCache };
}
