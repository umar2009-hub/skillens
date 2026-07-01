const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../utils/logger');

const quizService = {
  /**
   * Save or update quiz in the database
   */
  saveQuiz: async (documentId, accessToken, quizData) => {
    try {
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      const payload = {
        document_id: documentId,
        user_id: quizData.userId,
        questions: quizData.questions || [],
        status: quizData.status || 'completed',
        error_message: quizData.error_message || null,
        processing_time_ms: quizData.processing_time_ms || 0,
        retry_count: quizData.retry_count || 0,
        model_name: quizData.model_name || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await userSupabase
        .from('document_quizzes')
        .select('id')
        .eq('document_id', documentId)
        .single();

      let dbError;
      
      if (data) {
        const { error: updateError } = await userSupabase
          .from('document_quizzes')
          .update(payload)
          .eq('id', data.id);
        dbError = updateError;
      } else {
        const { error: insertError } = await userSupabase
          .from('document_quizzes')
          .insert([payload]);
        dbError = insertError;
      }

      if (dbError) {
        throw new Error(`Failed to save quiz: ${dbError.message}`);
      }

      logger.info(`[quiz] Saved successfully for document ${documentId}`);
      return true;
    } catch (error) {
      logger.error(`[quiz] Save error for document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Start a new quiz session
   */
  startSession: async (documentId, userId, quizId, accessToken) => {
    try {
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      const { data, error } = await userSupabase
        .from('user_quiz_sessions')
        .insert([{
          user_id: userId,
          document_id: documentId,
          quiz_id: quizId,
          status: 'in_progress'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error(`[quiz] Failed to start session for document ${documentId}:`, error);
      throw error;
    }
  },

  /**
   * Finish a quiz session
   */
  finishSession: async (sessionId, accessToken) => {
    try {
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      const { data, error } = await userSupabase
        .from('user_quiz_sessions')
        .update({ status: 'completed', finished_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error(`[quiz] Failed to finish session ${sessionId}:`, error);
      throw error;
    }
  },

  /**
   * Record a quiz attempt
   */
  saveAttempt: async (attemptData, accessToken) => {
    try {
      const userSupabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      const { data, error } = await userSupabase
        .from('user_quiz_attempts')
        .insert([{
          session_id: attemptData.sessionId,
          user_id: attemptData.userId,
          document_id: attemptData.documentId,
          quiz_id: attemptData.quizId,
          question_id: attemptData.questionId,
          selected_answer: attemptData.selectedAnswer,
          correct_answer: attemptData.correctAnswer,
          is_correct: attemptData.isCorrect,
          difficulty: attemptData.difficulty,
          topic: attemptData.topic,
          question_type: attemptData.questionType,
          time_taken: attemptData.timeTaken,
          confidence: attemptData.confidence,
          attempt_number: attemptData.attemptNumber || 1
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error(`[quiz] Failed to save attempt:`, error);
      throw error;
    }
  }
};

module.exports = quizService;
