const { createClient } = require('@supabase/supabase-js');
const config = require('../../config');

const revisionRepository = {
  getSupabaseClient: (accessToken) => {
    return createClient(config.supabaseUrl, config.supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });
  },

  fetchAllData: async (userId, accessToken) => {
    const supabase = revisionRepository.getSupabaseClient(accessToken);

    const [
      { data: quizAttempts },
      { data: flashcardProgress },
      { data: learningDNA },
      { data: revisionHistory }
    ] = await Promise.all([
      supabase.from('user_quiz_attempts').select('question_id, is_correct, topic, created_at, time_taken').eq('user_id', userId),
      supabase.from('user_flashcard_progress').select('flashcard_id, confidence, review_count, last_reviewed, updated_at').eq('user_id', userId),
      supabase.from('user_learning_dna').select('strong_topics, weak_topics, average_score').eq('user_id', userId),
      supabase.from('revision_history').select('topic, status, completed_at').eq('user_id', userId).order('completed_at', { ascending: false })
    ]);

    return {
      quizAttempts: quizAttempts || [],
      flashcardProgress: flashcardProgress || [],
      learningDNA: learningDNA || [],
      revisionHistory: revisionHistory || []
    };
  },

  recordAction: async (userId, topic, status, accessToken) => {
    const supabase = revisionRepository.getSupabaseClient(accessToken);
    await supabase.from('revision_history').insert({
      user_id: userId,
      topic,
      status
    });
  }
};

module.exports = revisionRepository;
