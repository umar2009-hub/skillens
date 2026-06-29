import api from './api';

export const analyticsService = {
  getOverview: () => api.get('/analytics/overview'),
  getProgress: () => api.get('/analytics/progress'),
};
