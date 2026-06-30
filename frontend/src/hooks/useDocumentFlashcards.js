import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import api from '@/services/api';

export function useDocumentFlashcards(documentId) {
  const [flashcards, setFlashcards] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) return;

    let isMounted = true;
    let channel;

    const fetchFlashcardsAndProgress = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        // Fetch flashcards
        const cardsResponse = await api.get(`/documents/${documentId}/flashcards`, {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        
        // Fetch user progress
        let progressData = [];
        try {
          const progRes = await api.get(`/documents/${documentId}/flashcards/progress`, {
            headers: { Authorization: `Bearer ${session?.access_token}` }
          });
          progressData = progRes.data || [];
        } catch (progErr) {
          console.warn("Failed to fetch progress", progErr);
        }

        if (isMounted) {
          setFlashcards(cardsResponse.data);
          setProgress(progressData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status !== 404 && err.response?.status !== 406) {
            setError(err.message || 'Failed to fetch flashcards');
          }
          setFlashcards(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchFlashcardsAndProgress();

    // Subscribe to realtime updates for document_flashcards
    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const channelName = `document_flashcards_${documentId}_${Math.random().toString(36).substring(7)}`;
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'document_flashcards',
            filter: `document_id=eq.${documentId}`
          },
          (payload) => {
            if (isMounted) {
              if (payload.eventType === 'DELETE') {
                setFlashcards(null);
              } else {
                setFlashcards(payload.new);
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

  const recordProgress = async (flashcardId, data) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await api.post(`/documents/${documentId}/flashcards/progress`, {
        flashcardId,
        progressData: data
      }, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      // Optimistic UI update
      setProgress(prev => {
        const existing = prev.find(p => p.flashcard_id === flashcardId);
        if (existing) {
          return prev.map(p => p.flashcard_id === flashcardId ? { ...p, ...data } : p);
        } else {
          return [...prev, { flashcard_id: flashcardId, ...data }];
        }
      });
    } catch (err) {
      console.error("Failed to record progress", err);
    }
  };

  const getHint = async (question, topic) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await api.post(`/documents/${documentId}/flashcards/hint`, { question, topic }, {
      headers: { Authorization: `Bearer ${session?.access_token}` }
    });
    return res.data.hint;
  };

  const explainFurther = async (question, answer, topic) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await api.post(`/documents/${documentId}/flashcards/explain`, { question, answer, topic }, {
      headers: { Authorization: `Bearer ${session?.access_token}` }
    });
    return res.data.explanation;
  };

  return { flashcards, progress, loading, error, recordProgress, getHint, explainFurther };
}
