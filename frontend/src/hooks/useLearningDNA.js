import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export function useLearningDNA() {
  const { session } = useAuth();
  const [dna, setDna] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGlobalDNA = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const response = await api.get('/learning-dna/global', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setDna(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const fetchDocumentDNA = useCallback(async (documentId) => {
    if (!session?.access_token || !documentId) return;
    setLoading(true);
    try {
      const response = await api.get(`/learning-dna/document/${documentId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setDna(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const forceRecalculate = useCallback(async (documentId = null) => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const response = await api.post('/learning-dna/recalculate', 
        { documentId },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setDna(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  return { dna, loading, error, fetchGlobalDNA, fetchDocumentDNA, forceRecalculate };
}
