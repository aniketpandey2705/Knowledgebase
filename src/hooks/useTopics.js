import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

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
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchTopics = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('topics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (fetchError) throw fetchError;
      setTopics(buildTree(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addTopic = async ({ name, aliases, parent_id }) => {
    if (!user) return;
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('topics')
        .insert({ name, aliases, parent_id, user_id: user.id });

      if (insertError) throw insertError;
      await fetchTopics();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editTopic = async (id, { name, aliases, parent_id }) => {
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('topics')
        .update({ name, aliases, parent_id })
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchTopics();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTopic = async (id) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchTopics();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { topics, loading, error, fetchTopics, addTopic, editTopic, deleteTopic };
}
