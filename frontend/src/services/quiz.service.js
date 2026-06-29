import api from './api';

export const quizService = {
  generateQuiz: (topicId) => api.post('/quiz/generate', { topicId }),
  submitQuiz: (quizId, answers) => api.post(`/quiz/${quizId}/submit`, { answers }),
};
