import { useState, useEffect } from 'react';
import api from '../services/api';
import { supabase } from '../lib/supabase';

export function useDocumentSummary(documentId) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchSummary() {
      if (!documentId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await api.get(`/documents/${documentId}/summary`, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
        
        if (isMounted) {
          setSummary(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.error || err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  return { summary, loading, error };
}
