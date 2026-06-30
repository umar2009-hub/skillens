const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../utils/logger');

const notesService = {
  /**
   * Saves or updates generated smart notes for a document.
   */
  saveNotes: async (documentId, accessToken, notesData) => {
    try {
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      // Check if notes already exist for this document
      const { data: existing } = await userSupabase
        .from('document_notes')
        .select('id')
        .eq('document_id', documentId)
        .maybeSingle();

      const payload = {
        document_id: documentId,
        user_id: notesData.userId,
        title: notesData.title || null,
        overview: notesData.overview || null,
        estimated_study_time: notesData.estimated_study_time || null,
        difficulty: notesData.difficulty || null,
        learning_outcomes: notesData.learning_outcomes || null,
        prerequisites: notesData.prerequisites || null,
        revision_priority: notesData.revision_priority || null,
        total_topics: notesData.total_topics || 0,
        sections: notesData.sections || null,
        status: notesData.status || 'completed',
        error_message: notesData.error_message || null,
        processing_time_ms: notesData.processing_time_ms || 0,
        model_name: notesData.model_name || null,
        retry_count: notesData.retry_count || 0,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        result = await userSupabase
          .from('document_notes')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await userSupabase
          .from('document_notes')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        throw new Error(`Failed to save document_notes: ${result.error.message}`);
      }

      return result.data;
    } catch (error) {
      logger.error(`Error saving notes for document ${documentId}:`, error);
      throw error;
    }
  }
};

module.exports = notesService;
