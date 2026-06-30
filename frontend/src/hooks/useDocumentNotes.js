import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import api from '@/services/api';

export function useDocumentNotes(documentId) {
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) return;

    let isMounted = true;
    let channel;

    const fetchNotes = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        // Use our API endpoint
        const response = await api.get(`/documents/${documentId}/notes`, {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        
        if (isMounted) {
          setNotes(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          // It's expected to 404 if notes aren't generated yet. We only set error if it's not a 404
          if (err.response?.status !== 404 && err.response?.status !== 406) {
            setError(err.message || 'Failed to fetch notes');
          }
          setNotes(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNotes();

    // Subscribe to realtime updates for document_notes
    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Ensure a unique channel name to prevent StrictMode subscribe errors
      const channelName = `document_notes_${documentId}_${Math.random().toString(36).substring(7)}`;
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'document_notes',
            filter: `document_id=eq.${documentId}`
          },
          (payload) => {
            if (isMounted) {
              if (payload.eventType === 'DELETE') {
                setNotes(null);
              } else {
                setNotes(payload.new);
              }
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [documentId]);

  return { notes, loading, error };
}
