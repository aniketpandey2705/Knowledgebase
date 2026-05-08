import { supabase } from './supabase';

/**
 * Centralized API layer for Knowledge Base.
 * All functions include error handling and throw errors to be caught by hooks/components.
 */

export const api = {
  // --- TOPICS ---
  async getTopics(userId) {
    const { data, error } = await supabase
      .from('topics')
      .select('*, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createTopic(topicData) {
    const { data, error } = await supabase
      .from('topics')
      .insert(topicData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTopic(id, updates) {
    const { data, error } = await supabase
      .from('topics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTopic(id) {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // --- CONTENT ---
  async getContentByTopic(topicId) {
    const { data, error } = await supabase
      .from('content')
      .select('*, topics(name, parent_id)')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getAllContent(userId) {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async createContent(contentData) {
    const { data, error } = await supabase
      .from('content')
      .insert(contentData)
      .select()
      .single();
    if (error) throw error;
    
    // Touch topic updated_at
    await supabase.from('topics').update({ updated_at: new Date() }).eq('id', contentData.topic_id);
    
    return data;
  },

  async updateContent(id, updates, topicId) {
    const { data, error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Touch topic updated_at
    if (topicId) {
      await supabase.from('topics').update({ updated_at: new Date() }).eq('id', topicId);
    }

    return data;
  },

  async deleteContent(id, storagePath = null, topicId = null) {
    // Delete from DB
    const { error: dbError } = await supabase
      .from('content')
      .delete()
      .eq('id', id);
    if (dbError) throw dbError;

    // Touch topic updated_at
    if (topicId) {
      await supabase.from('topics').update({ updated_at: new Date() }).eq('id', topicId);
    }

    // Delete from Storage if path provided
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('knowledge-files')
        .remove([storagePath]);
      if (storageError) console.error("Storage cleanup failed:", storageError);
    }
  },

  // --- SEARCH ---
  async search(userId, query, filters = {}) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return { topics: [], content: [] };

    // Topic search
    const topicPromise = supabase
      .from('topics')
      .select('*')
      .eq('user_id', userId)
      .or(`name.wsearch.${cleanQuery},aliases.cs.{${cleanQuery.toLowerCase()}}`);

    // Content search
    let contentQuery = supabase
      .from('content')
      .select('*, topics(name, parent_id)')
      .eq('user_id', userId)
      .textSearch('title', cleanQuery, { type: 'websearch' });

    if (filters.type) contentQuery = contentQuery.eq('type', filters.type);
    if (filters.topic_id) contentQuery = contentQuery.eq('topic_id', filters.topic_id);

    const [topicRes, contentRes] = await Promise.all([topicPromise, contentPromise()]);
    // Note: Wrapping contentQuery in a function call to avoid execution issues in Promise.all if needed,
    // but standard supabase queries work fine.
    
    // Actually let's just await them directly
    const { data: topics, error: tErr } = await topicPromise;
    const { data: content, error: cErr } = await contentQuery;

    if (tErr) throw tErr;
    if (cErr) throw cErr;

    return { topics, content };
  }
};
