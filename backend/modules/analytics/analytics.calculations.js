const utils = require('./analytics.utils');

const calculations = {
  calculateOverview: (rawData) => {
    let totalStudySeconds = 0;
    
    // 1. Calculate from formal study sessions
    rawData.studySessions.forEach(s => {
      if (s.duration_seconds) totalStudySeconds += s.duration_seconds;
      else if (s.started_at && s.ended_at) {
        totalStudySeconds += Math.floor((new Date(s.ended_at) - new Date(s.started_at)) / 1000);
      }
    });

    // 2. Hybrid estimation if formal sessions are missing
    if (totalStudySeconds === 0) {
      rawData.quizAttempts.forEach(qa => {
        if (qa.time_taken) totalStudySeconds += qa.time_taken;
        else totalStudySeconds += 15; // fallback 15s per question
      });
      totalStudySeconds += rawData.flashcardProgress.length * 10; // 10s per review
    }

    const totalLearningSessions = rawData.studySessions.length || (rawData.quizSessions.length + (rawData.flashcardProgress.length > 0 ? 1 : 0));
    
    // Accuracy
    let correctAnswers = 0;
    rawData.quizAttempts.forEach(qa => {
      if (qa.is_correct) correctAnswers++;
    });
    const averageQuizAccuracy = rawData.quizAttempts.length > 0 
      ? Math.round((correctAnswers / rawData.quizAttempts.length) * 100) 
      : 0;

    // Streaks
    const allActivityDates = [
      ...rawData.studySessions.map(s => s.started_at),
      ...rawData.quizSessions.map(s => s.created_at),
      ...rawData.flashcardProgress.map(f => f.updated_at)
    ].filter(Boolean);

    const uniqueDays = utils.getUniqueDays(allActivityDates);
    const currentStreak = utils.calculateStreak(uniqueDays);
    const longestStreak = utils.calculateLongestStreak(uniqueDays);

    return {
      totalStudyTimeMinutes: Math.floor(totalStudySeconds / 60),
      totalLearningSessions,
      pdfsStudied: rawData.documents.length,
      flashcardsReviewed: rawData.flashcardProgress.reduce((acc, curr) => acc + (curr.review_count || 1), 0),
      quizAttempts: rawData.quizAttempts.length,
      averageQuizAccuracy,
      currentStreak,
      longestStreak,
      uniqueDaysActive: uniqueDays.length
    };
  },

  calculateTopics: (rawData) => {
    const topicScores = {};

    // 1. Quiz Accuracy contribution (weight 0.5)
    rawData.quizAttempts.forEach(qa => {
      if (!qa.topic) return;
      if (!topicScores[qa.topic]) topicScores[qa.topic] = { attempts: 0, correct: 0, confidenceScore: 0, reviews: 0 };
      
      topicScores[qa.topic].attempts++;
      if (qa.is_correct) topicScores[qa.topic].correct++;
    });

    // We can't directly map flashcard topic unless it's in the data, but we use learning DNA as fallback
    // Calculate final scores
    const scoredTopics = Object.keys(topicScores).map(topic => {
      const data = topicScores[topic];
      const accuracy = data.attempts > 0 ? (data.correct / data.attempts) * 100 : 0;
      return { topic, score: accuracy, attempts: data.attempts };
    }).filter(t => t.attempts > 0);

    scoredTopics.sort((a, b) => b.score - a.score);

    return {
      strongTopics: scoredTopics.filter(t => t.score >= 70).slice(0, 3),
      weakTopics: scoredTopics.filter(t => t.score < 70).reverse().slice(0, 3)
    };
  },

  calculateCharts: (rawData) => {
    // Activity Chart (Last 7 days of attempts/reviews)
    const activityMap = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      activityMap[d.toISOString().split('T')[0]] = { date: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-US', { weekday: 'short' }), value: 0 };
    }

    rawData.quizAttempts.forEach(qa => {
      if (!qa.created_at) return;
      const d = new Date(qa.created_at).toISOString().split('T')[0];
      if (activityMap[d]) activityMap[d].value++;
    });
    
    rawData.flashcardProgress.forEach(fp => {
      if (!fp.updated_at) return;
      const d = new Date(fp.updated_at).toISOString().split('T')[0];
      if (activityMap[d]) activityMap[d].value++;
    });

    // Knowledge Growth (Accuracy over time)
    // Group quiz attempts by day
    const accuracyMap = {};
    rawData.quizAttempts.forEach(qa => {
      if (!qa.created_at) return;
      const d = new Date(qa.created_at).toISOString().split('T')[0];
      if (!accuracyMap[d]) accuracyMap[d] = { total: 0, correct: 0, date: d };
      accuracyMap[d].total++;
      if (qa.is_correct) accuracyMap[d].correct++;
    });

    const growth = Object.values(accuracyMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(entry => ({
        date: entry.date,
        value: Math.round((entry.correct / entry.total) * 100)
      }));

    // Study Distribution
    const distribution = [
      { label: 'Quizzes', value: rawData.quizAttempts.length * 2 }, // proxy for minutes
      { label: 'Flashcards', value: rawData.flashcardProgress.length * 1 },
      { label: 'Reading', value: rawData.documents.length * 10 }
    ].filter(d => d.value > 0);

    return {
      activity: Object.values(activityMap),
      growth,
      distribution
    };
  }
};

module.exports = calculations;
