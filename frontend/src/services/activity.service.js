import api from './api';
import { supabase } from '../lib/supabase';

export const activityService = {
  getRecentActivity: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Fetch from documents as the primary source of activity for now
      // In the future, this can aggregate from multiple endpoints or a dedicated /activity endpoint
      const response = await api.get('/documents', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      
      const documents = response.data || [];
      
      // Map to normalized notification model
      const activities = documents.map(doc => ({
        id: `doc-${doc.id}`,
        type: 'document_processed',
        title: 'Document Ready',
        message: `Your document "${doc.filename}" is ready for study.`,
        timestamp: doc.created_at,
        link: `/documents/${doc.id}`,
        read: true // mock read state for now
      }));
      
      // Sort chronologically (newest first)
      return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      return []; // Return empty array on failure to gracefully handle errors
    }
  }
};
