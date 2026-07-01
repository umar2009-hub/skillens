const { createClient } = require('@supabase/supabase-js');
const config = require('../config');
const logger = require('../utils/logger');

const learningDnaService = {
  /**
   * Main entry point to recalculate a user's DNA for a specific document or globally.
   * If documentId is null, it recalculates global DNA.
   */
  recalculateDNA: async (userId, documentId = null, accessToken) => {
    try {
      logger.info(`[Learning DNA] Recalculating for user: ${userId}, doc: ${documentId || 'GLOBAL'}`);
      
      const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } }
      });

      // 1. Fetch raw data
      const data = await learningDnaService._fetchRawData(userId, documentId, supabase);
      
      if (data.attempts.length === 0 && data.flashcardProgress.length === 0) {
        logger.info('[Learning DNA] No data found to calculate DNA.');
        return null;
      }

      // 2. Run calculations
      const accuracyScore = learningDnaService.calculateAccuracy(data.attempts);
      const { topicsMastered, topicsToImprove, topicStats } = learningDnaService.calculateTopicPerformance(data.attempts);
      const confidenceScore = learningDnaService.calculateConfidence(data.attempts);
      const consistencyScore = learningDnaService.calculateConsistency(data.sessions, data.flashcardProgress);
      const studyTime = learningDnaService.calculateStudyTime(data.attempts, data.flashcardProgress);
      const averageResponseTime = learningDnaService.calculateAverageResponseTime(data.attempts);
      const learningVelocity = learningDnaService.calculateLearningVelocity(data.sessions, data.attempts);
      
      const knowledgeScore = learningDnaService.calculateKnowledgeScore(accuracyScore, data.flashcardProgress, topicsMastered.length);
      const revisionPriority = learningDnaService.calculateRevisionPriority(topicStats, data.flashcardProgress);

      const dnaRecord = {
        user_id: userId,
        document_id: documentId,
        knowledge_score: knowledgeScore,
        accuracy_score: accuracyScore,
        confidence_score: confidenceScore,
        consistency_score: consistencyScore,
        study_time: studyTime,
        average_response_time: averageResponseTime,
        learning_velocity: learningVelocity,
        topics_mastered: topicsMastered,
        topics_to_improve: topicsToImprove,
        revision_priority: revisionPriority,
        documents_completed: data.uniqueDocsCompleted,
        flashcards_reviewed: data.flashcardProgress.length,
        quizzes_completed: data.sessions.filter(s => s.status === 'completed').length,
        last_quiz_score: data.lastQuizScore,
        last_study_session: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 3. Upsert into database
      const { data: result, error } = await supabase
        .from('user_learning_dna')
        .upsert(dnaRecord, { onConflict: 'user_id, document_id', ignoreDuplicates: false })
        .select()
        .single();

      if (error) throw error;
      
      logger.info(`[Learning DNA] Recalculation successful.`);
      return result;
    } catch (error) {
      console.error('[Learning DNA] Error recalculating DNA:', error);
      throw error;
    }
  },

  _fetchRawData: async (userId, documentId, supabase) => {
    let sessionQuery = supabase.from('user_quiz_sessions').select('*').eq('user_id', userId);
    let attemptQuery = supabase.from('user_quiz_attempts').select('*').eq('user_id', userId);
    let fcQuery = supabase.from('user_flashcard_progress').select('*').eq('user_id', userId);

    if (documentId) {
      sessionQuery = sessionQuery.eq('document_id', documentId);
      attemptQuery = attemptQuery.eq('document_id', documentId);
      fcQuery = fcQuery.eq('document_id', documentId);
    }

    const [
      { data: sessions = [] }, 
      { data: attempts = [] }, 
      { data: flashcardProgress = [] }
    ] = await Promise.all([sessionQuery, attemptQuery, fcQuery]);

    // Calculate unique docs completed globally
    let uniqueDocsCompleted = 0;
    if (!documentId) {
       const uniqueDocs = new Set(sessions.filter(s => s.status === 'completed').map(s => s.document_id));
       uniqueDocsCompleted = uniqueDocs.size;
    }

    // Find last quiz score
    let lastQuizScore = 0;
    const completedSessions = sessions.filter(s => s.status === 'completed').sort((a, b) => new Date(b.finished_at) - new Date(a.finished_at));
    if (completedSessions.length > 0) {
      const lastSessionId = completedSessions[0].id;
      const lastAttempts = attempts.filter(a => a.session_id === lastSessionId);
      if (lastAttempts.length > 0) {
         lastQuizScore = Math.round((lastAttempts.filter(a => a.is_correct).length / lastAttempts.length) * 100);
      }
    }

    return { sessions, attempts, flashcardProgress, uniqueDocsCompleted, lastQuizScore };
  },

  calculateAccuracy: (attempts) => {
    if (!attempts || attempts.length === 0) return 0;
    const correct = attempts.filter(a => a.is_correct).length;
    return Math.round((correct / attempts.length) * 100);
  },

  calculateTopicPerformance: (attempts) => {
    if (!attempts || attempts.length === 0) return { topicsMastered: [], topicsToImprove: [], topicStats: {} };
    
    const topicStats = {};
    attempts.forEach(a => {
      if (!a.topic) return;
      if (!topicStats[a.topic]) topicStats[a.topic] = { total: 0, correct: 0, confidences: [] };
      topicStats[a.topic].total += 1;
      if (a.is_correct) topicStats[a.topic].correct += 1;
      topicStats[a.topic].confidences.push(a.confidence);
    });

    const topicsMastered = [];
    const topicsToImprove = [];

    for (const [topic, stats] of Object.entries(topicStats)) {
      stats.accuracy = Math.round((stats.correct / stats.total) * 100);
      
      if (stats.accuracy >= 80 && stats.total >= 3) {
        topicsMastered.push(topic);
      } else if (stats.accuracy < 60 || stats.total < 2) {
        topicsToImprove.push(topic);
      }
    }

    return { topicsMastered, topicsToImprove, topicStats };
  },

  calculateConfidence: (attempts) => {
    if (!attempts || attempts.length === 0) return 0;
    
    const confidenceWeights = { high: 1, medium: 0.5, low: 0 };
    let score = 0;
    let validAttempts = 0;

    attempts.forEach(a => {
      if (!a.confidence) return;
      validAttempts++;
      const w = confidenceWeights[a.confidence] ?? 0.5;
      
      // Penalty for overconfidence (wrong but highly confident)
      if (a.confidence === 'high' && !a.is_correct) {
        score -= 20; 
      } 
      // Reward for calibrated confidence
      else if (a.confidence === 'high' && a.is_correct) {
        score += 100;
      } 
      else if (a.confidence === 'low' && !a.is_correct) {
        score += 80; // Good awareness
      }
      else {
        score += (w * 100);
      }
    });

    if (validAttempts === 0) return 0;
    return Math.max(0, Math.min(100, Math.round(score / validAttempts)));
  },

  calculateConsistency: (sessions, flashcards) => {
    // Basic consistency: frequency of study over time
    if (!sessions.length && !flashcards.length) return 0;
    
    // Group activity by day
    const activeDays = new Set();
    sessions.forEach(s => activeDays.add(new Date(s.created_at).toDateString()));
    flashcards.forEach(f => activeDays.add(new Date(f.last_reviewed || f.updated_at).toDateString()));
    
    // Simplistic score based on unique active days (cap at 100)
    // In a real prod environment, you'd calculate streaks.
    return Math.min(100, activeDays.size * 10);
  },

  calculateStudyTime: (attempts, flashcards) => {
    let totalSeconds = 0;
    attempts.forEach(a => totalSeconds += (a.time_taken || 0));
    // Assume 15s per flashcard review if not tracked
    flashcards.forEach(f => totalSeconds += (f.review_count * 15));
    return totalSeconds;
  },

  calculateAverageResponseTime: (attempts) => {
    const valid = attempts.filter(a => a.time_taken > 0);
    if (valid.length === 0) return 0;
    const sum = valid.reduce((acc, curr) => acc + curr.time_taken, 0);
    return Math.round(sum / valid.length);
  },

  calculateLearningVelocity: (sessions, attempts) => {
    const completed = sessions.filter(s => s.status === 'completed').sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (completed.length < 2) return 0; // Not enough data for velocity

    // Compare first half of sessions to second half
    const mid = Math.floor(completed.length / 2);
    const firstHalfIds = completed.slice(0, mid).map(s => s.id);
    const secondHalfIds = completed.slice(mid).map(s => s.id);

    const firstAttempts = attempts.filter(a => firstHalfIds.includes(a.session_id));
    const secondAttempts = attempts.filter(a => secondHalfIds.includes(a.session_id));

    const firstAcc = learningDnaService.calculateAccuracy(firstAttempts);
    const secondAcc = learningDnaService.calculateAccuracy(secondAttempts);

    // Velocity is the delta
    return Math.max(-100, Math.min(100, secondAcc - firstAcc));
  },

  calculateKnowledgeScore: (accuracyScore, flashcards, masteredTopicsCount) => {
    // Weighted combination of accuracy, flashcard mastery, and broad topic mastery
    const fcMastery = flashcards.length > 0 
      ? Math.round((flashcards.filter(f => f.confidence === 'knew_it').length / flashcards.length) * 100)
      : 0;
    
    const topicBonus = Math.min(20, masteredTopicsCount * 5); // up to 20 points for topic breadth
    
    let baseScore = (accuracyScore * 0.6) + (fcMastery * 0.4);
    return Math.min(100, Math.round(baseScore + topicBonus));
  },

  calculateRevisionPriority: (topicStats, flashcards) => {
    const priorities = [];
    
    // Find topics with low accuracy
    for (const [topic, stats] of Object.entries(topicStats)) {
      if (stats.accuracy < 60) {
        priorities.push({ topic, reason: 'Low quiz accuracy', type: 'quiz' });
      }
    }

    // Find flashcards needing revision
    const hardFlashcards = flashcards.filter(f => f.confidence === 'needs_revision');
    if (hardFlashcards.length > 0) {
      priorities.push({ topic: 'Flashcards', reason: `${hardFlashcards.length} cards marked for revision`, type: 'flashcard' });
    }

    return priorities.slice(0, 5); // Return top 5 priorities
  }
};

module.exports = learningDnaService;
