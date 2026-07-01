import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/constants/api';

export function useMentor(documentId = 'global') {
  const { session } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session?.access_token) {
      fetchHistory();
    }
  }, [documentId, session?.access_token]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/mentor/history/${documentId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setMessages(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      setIsLoading(true);
      await api.delete(`/mentor/history/${documentId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      setMessages([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isStreaming) return;
    
    const userMsg = { role: 'user', message: content, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setError(null);

    setMessages(prev => [...prev, { role: 'model', message: '', created_at: new Date().toISOString(), isTemp: true }]);

    try {
      const payload = { message: content };
      if (documentId !== 'global') {
        payload.documentId = documentId;
      }

      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/mentor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to connect to mentor');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // Keep the last incomplete line
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) {
                  setError(parsed.error);
                } else if (parsed.text) {
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    if (lastMsg && lastMsg.role === 'model' && lastMsg.isTemp) {
                      newMsgs[newMsgs.length - 1] = {
                        ...lastMsg,
                        message: lastMsg.message + parsed.text
                      };
                    }
                    return newMsgs;
                  });
                }
              } catch (e) {
                // Ignore partial JSON parse errors
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setMessages(prev => prev.filter(m => !m.isTemp));
    } finally {
      setMessages(prev => prev.map(m => m.isTemp ? { ...m, isTemp: undefined } : m));
      setIsStreaming(false);
    }
  }, [documentId, session, isStreaming]);

  return { messages, isLoading, isStreaming, error, sendMessage, clearHistory };
}
