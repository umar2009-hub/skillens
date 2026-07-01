import api from './api';
import { supabase } from '../lib/supabase';

export const analyticsService = {
  getDashboardAnalytics: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await api.get('/analytics/dashboard', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw new Error(error?.response?.data?.error || 'Failed to fetch analytics');
    }
  }
};
