const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');

const analyticsRepository = {
  getSupabaseClient: (accessToken) => {
    return createClient(config.supabaseUrl, config.supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
  },

  fetchUserRawData: async (userId, accessToken) => {
    const supabase = analyticsRepository.getSupabaseClient(accessToken);

    // Batch fetching all necessary data for analytics
    const [
      { data: documents },
      { data: studySessions },
      { data: quizAttempts },
      { data: quizSessions },
      { data: flashcardProgress },
      { data: learningDNA }
    ] = await Promise.all([
      supabase.from('documents').select('id, created_at, status').eq('user_id', userId),
      supabase.from('study_sessions').select('id, activity_type, started_at, ended_at, duration_seconds').eq('user_id', userId),
      supabase.from('user_quiz_attempts').select('id, question_id, is_correct, topic, created_at, time_taken, document_id').eq('user_id', userId),
      supabase.from('user_quiz_sessions').select('id, created_at, finished_at').eq('user_id', userId),
      supabase.from('user_flashcard_progress').select('id, flashcard_id, confidence, review_count, last_reviewed, updated_at, document_id').eq('user_id', userId),
      supabase.from('user_learning_dna').select('document_id, strong_topics, weak_topics, average_score, learning_style').eq('user_id', userId)
    ]);

    return {
      documents: documents || [],
      studySessions: studySessions || [],
      quizAttempts: quizAttempts || [],
      quizSessions: quizSessions || [],
      flashcardProgress: flashcardProgress || [],
      learningDNA: learningDNA || []
    };
  }
};

module.exports = analyticsRepository;
