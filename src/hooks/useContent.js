import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useContent() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchContent = useCallback(async (topic_id) => {
    if (!topic_id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('content')
        .select('*')
        .eq('topic_id', topic_id)
        .order('created_at');

      if (fetchError) throw fetchError;
      setContent(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addContent = async (contentData) => {
    if (!user) return;
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('content')
        .insert({ ...contentData, user_id: user.id });

      if (insertError) throw insertError;
      if (contentData.topic_id) {
        await fetchContent(contentData.topic_id);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editContent = async (id, fields, topic_id) => {
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('content')
        .update(fields)
        .eq('id', id);

      if (updateError) throw updateError;
      if (topic_id) {
        await fetchContent(topic_id);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteContent = async (id, topic_id) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('content')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      if (topic_id) {
        await fetchContent(topic_id);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { content, loading, error, fetchContent, addContent, editContent, deleteContent };
}
