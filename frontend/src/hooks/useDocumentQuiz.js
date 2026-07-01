import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { quizService } from '@/services/quiz.service';

export function useDocumentQuiz(documentId) {
  const [quizData, setQuizData] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) return;

    let isMounted = true;
    let channel;

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const { data: { session: authSession } } = await supabase.auth.getSession();
        
        const response = await quizService.getQuiz(documentId, authSession?.access_token);
        
        if (isMounted) {
          setQuizData(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status !== 404 && err.response?.status !== 406) {
            setError(err.message || 'Failed to fetch quiz');
          }
          setQuizData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchQuiz();

    // Subscribe to realtime updates for document_quizzes
    const setupRealtime = async () => {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) return;

      const channelName = `document_quizzes_${documentId}_${Math.random().toString(36).substring(7)}`;
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'document_quizzes',
            filter: `document_id=eq.${documentId}`
          },
          (payload) => {
            if (isMounted) {
              if (payload.eventType === 'DELETE') {
                setQuizData(null);
              } else {
                setQuizData(payload.new);
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

  const startSession = async () => {
    if (!quizData || !quizData.id) return null;
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const res = await quizService.startSession(documentId, quizData.id, authSession?.access_token);
      setSession(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to start session', err);
      throw err;
    }
  };

  const submitAttempt = async (attemptData) => {
    if (!session) throw new Error('No active session');
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      await quizService.submitAttempt(documentId, {
        ...attemptData,
        sessionId: session.id,
        quizId: quizData.id
      }, authSession?.access_token);
    } catch (err) {
      console.error('Failed to submit attempt', err);
      throw err;
    }
  };

  const finishSession = async () => {
    if (!session) return;
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      await quizService.finishSession(session.id, authSession?.access_token);
    } catch (err) {
      console.error('Failed to finish session', err);
    }
  };

  const getAnalytics = async () => {
    if (!session) return null;
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const res = await quizService.getAnalytics(documentId, session.id, authSession?.access_token);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch analytics', err);
      throw err;
    }
  };

  return {
    quizData,
    loading,
    error,
    session,
    startSession,
    submitAttempt,
    finishSession,
    getAnalytics
  };
}
