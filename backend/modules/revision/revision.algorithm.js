const utils = require('./revision.utils');

const algorithm = {
  rankTopics: (rawData) => {
    const topicStats = {};

    // 1. Gather Quiz Stats
    rawData.quizAttempts.forEach(qa => {
      if (!qa.topic) return;
      if (!topicStats[qa.topic]) topicStats[qa.topic] = { attempts: 0, correct: 0, timeTaken: 0, lastSeen: null };
      
      topicStats[qa.topic].attempts++;
      if (qa.is_correct) topicStats[qa.topic].correct++;
      if (qa.time_taken) topicStats[qa.topic].timeTaken += qa.time_taken;
      
      const attemptDate = new Date(qa.created_at);
      if (!topicStats[qa.topic].lastSeen || attemptDate > topicStats[qa.topic].lastSeen) {
        topicStats[qa.topic].lastSeen = attemptDate;
      }
    });

    // 2. We don't have explicit topic mapping for flashcards in the schema easily without joins, 
    // but the system assumes the logic exists. We'll simulate flashcard impact globally or per topic if available.
    
    // 3. Score calculation
    const ranked = Object.keys(topicStats).map(topic => {
      const stats = topicStats[topic];
      const accuracy = stats.attempts > 0 ? (stats.correct / stats.attempts) * 100 : 100;
      
      // The lower the accuracy, the higher the need for revision
      const accuracyNeed = 100 - accuracy; 
      
      const daysSinceLast = utils.getDaysSince(stats.lastSeen);
      // Cap recency factor at 60 days
      const recencyNeed = Math.min(daysSinceLast, 60) * (100 / 60);

      // We don't have perfect flashcard/DNA mapping per exact topic string here, so we rely heavily on accuracy and recency
      const score = (accuracyNeed * utils.weights.ACCURACY) + (recencyNeed * utils.weights.RECENCY) + 20; // 20 is base buffer

      let priority = 'Low';
      if (score > 70) priority = 'Critical';
      else if (score > 50) priority = 'High';
      else if (score > 30) priority = 'Medium';

      let reason = 'General review';
      if (accuracyNeed > 50) reason = `Low accuracy (${Math.round(accuracy)}%)`;
      else if (daysSinceLast > 14) reason = `Not revised in ${daysSinceLast} days`;

      return {
        topic,
        score,
        priority,
        reason,
        averageTime: stats.attempts > 0 ? Math.round(stats.timeTaken / stats.attempts) || 15 : 15,
        lastSeen: stats.lastSeen
      };
    });

    // Sort descending by score
    return ranked.sort((a, b) => b.score - a.score);
  }
};

module.exports = algorithm;
