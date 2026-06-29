import api from './api';

export const mentorService = {
  askQuestion: (question) => api.post('/mentor/ask', { question }),
  getHistory: () => api.get('/mentor/history'),
};
