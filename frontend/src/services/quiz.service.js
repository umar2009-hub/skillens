import api from './api';

export const quizService = {
  getQuiz: (documentId, token) => api.get(`/documents/${documentId}/quiz`, { headers: { Authorization: `Bearer ${token}` } }),
  startSession: (documentId, quizId, token) => api.post(`/documents/${documentId}/quiz/session`, { quizId }, { headers: { Authorization: `Bearer ${token}` } }),
  submitAttempt: (documentId, attemptData, token) => api.post(`/documents/${documentId}/quiz/attempt`, attemptData, { headers: { Authorization: `Bearer ${token}` } }),
  finishSession: (sessionId, token) => api.post(`/documents/quiz/session/${sessionId}/finish`, {}, { headers: { Authorization: `Bearer ${token}` } }),
  getAnalytics: (documentId, sessionId, token) => api.get(`/documents/${documentId}/quiz/analytics/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } })
};
