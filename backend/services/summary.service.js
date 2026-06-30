const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../utils/logger');

const summaryService = {
  /**
   * Saves the generated summary to the document_summaries table using a user-scoped client.
   */
  saveSummary: async (documentId, accessToken, payload) => {
    // Scope client to the user to bypass RLS safely
    const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    try {
      logger.info(`Saving summary for document ${documentId}`);
      
      const { data, error } = await userSupabase
        .from('document_summaries')
        .upsert({
          document_id: documentId,
          user_id: payload.userId,
          executive_summary: payload.executive_summary,
          key_concepts: payload.key_concepts,
          topics: payload.topics,
          difficulty_level: payload.difficulty_level,
          estimated_study_time: payload.estimated_study_time,
          model_name: payload.model_name,
          processing_time_ms: payload.processing_time_ms,
          status: payload.status || 'completed',
          error_message: payload.error_message || null,
          retry_count: payload.retry_count || 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'document_id' })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save summary: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error(`Error saving summary for ${documentId}:`, error);
      throw error;
    }
  }
};

module.exports = summaryService;
