import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useUpload() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = async (file, userId, type) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    // Simulate progress since Supabase standard upload doesn't emit progress events easily
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const timestamp = now.getTime();
      
      // Clean filename to prevent weird URL issues
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const path = `${userId}/${type || 'misc'}/${year}/${month}/${timestamp}_${cleanFileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('knowledge-files')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setProgress(100);
      clearInterval(progressInterval);

      const { data: { publicUrl } } = supabase.storage
        .from('knowledge-files')
        .getPublicUrl(path);

      setLoading(false);
      return { publicUrl, fileName: file.name, path };
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { uploadFile, progress, loading, error };
}
