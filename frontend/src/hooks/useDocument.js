import { useState, useEffect } from 'react';
import api from '../services/api';
import { supabase } from '../lib/supabase';

export function useDocument(documentId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchDocument() {
      if (!documentId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await api.get(`/documents/${documentId}`, {
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });
        
        if (isMounted) {
          setData(response.data);
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

    fetchDocument();

    return () => {
      isMounted = false;
    };
  }, [documentId]);

  return { data, loading, error };
}
