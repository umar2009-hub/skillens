const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../utils/logger');

const flashcardsService = {
  /**
   * Save or update flashcards in the database
   */
  saveFlashcards: async (documentId, accessToken, flashcardsData) => {
    try {
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      const payload = {
        document_id: documentId,
        user_id: flashcardsData.userId,
        cards: flashcardsData.cards || [],
        status: flashcardsData.status || 'completed',
        error_message: flashcardsData.error_message || null,
        processing_time_ms: flashcardsData.processing_time_ms || 0,
        retry_count: flashcardsData.retry_count || 0,
        model_name: flashcardsData.model_name || null,
        updated_at: new Date().toISOString()
      };

      // Upsert: Try to update existing flashcards for this document, or insert new
      const { data, error } = await userSupabase
        .from('document_flashcards')
        .select('id')
        .eq('document_id', documentId)
        .single();

      let dbError;
      
      if (data) {
        const { error: updateError } = await userSupabase
          .from('document_flashcards')
          .update(payload)
          .eq('id', data.id);
        dbError = updateError;
      } else {
        const { error: insertError } = await userSupabase
          .from('document_flashcards')
          .insert([payload]);
        dbError = insertError;
      }

      if (dbError) {
        throw new Error(`Failed to save flashcards: ${dbError.message}`);
      }

      logger.info(`[flashcards] Saved successfully for document ${documentId}`);
      return true;
    } catch (error) {
      logger.error(`[flashcards] Save error for document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch flashcards for a specific document
   */
  getFlashcards: async (documentId, accessToken) => {
    const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    const { data, error } = await userSupabase
      .from('document_flashcards')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error) {
      throw error;
    }
    
    return data;
  },

  /**
   * Update flashcard progress for a user (Local interaction tracking)
   */
  updateProgress: async (documentId, flashcardId, progressData, accessToken) => {
    const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const payload = {
        user_id: user.id,
        document_id: documentId,
        flashcard_id: flashcardId,
        ...progressData,
        last_reviewed: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const { data: existing } = await userSupabase
        .from('user_flashcard_progress')
        .select('id, review_count')
        .eq('user_id', user.id)
        .eq('document_id', documentId)
        .eq('flashcard_id', flashcardId)
        .single();

    let dbError;
    if (existing) {
        // Only increment review_count if it was explicitly a review action
        if (progressData.confidence) {
            payload.review_count = (existing.review_count || 0) + 1;
        }
        
        const { error } = await userSupabase
            .from('user_flashcard_progress')
            .update(payload)
            .eq('id', existing.id);
        dbError = error;
    } else {
        if (progressData.confidence) {
            payload.review_count = 1;
        }
        const { error } = await userSupabase
            .from('user_flashcard_progress')
            .insert([payload]);
        dbError = error;
    }

    if (dbError) throw dbError;
    return true;
  },

  /**
   * Fetch user's flashcard progress for a document
   */
  getProgress: async (documentId, accessToken) => {
    const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
    
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await userSupabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('document_id', documentId);

    if (error) throw error;
    return data || [];
  }
};

module.exports = flashcardsService;
