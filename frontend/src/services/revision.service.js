import api from './api';
import { supabase } from '../lib/supabase';

export const revisionService = {
  getRevisionPlan: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await api.get('/revision/plan', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch revision plan:', error);
      throw new Error(error?.response?.data?.error || 'Failed to fetch revision plan');
    }
  },

  recordAction: async (topic, action) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await api.post('/revision/action', 
        { topic, action },
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to record revision action:', error);
      throw new Error(error?.response?.data?.error || 'Failed to record action');
    }
  }
};
