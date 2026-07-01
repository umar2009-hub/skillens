const repository = require('./revision.repository');
const algorithm = require('./revision.algorithm');
const scheduler = require('./revision.scheduler');
const ai = require('./revision.ai');

// Cache structure: Map<userId, { timestamp, hash, coachMessage }>
const coachCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const generatePlanHash = (todayPlan) => {
  return todayPlan.map(t => t.topic).join('|');
};

const service = {
  generateRevisionPlan: async (userId, accessToken) => {
    // 1. Gather Data
    const rawData = await repository.fetchAllData(userId, accessToken);

    // 2. Rank Topics
    const rankedTopics = algorithm.rankTopics(rawData);

    // 3. Build Plans
    const { today, upcoming, estimatedTimeMinutes } = scheduler.buildPlans(rankedTopics, rawData.revisionHistory);

    // 4. Generate/Fetch Coach Message
    let coachMessage = null;
    if (today.length > 0) {
      const planHash = generatePlanHash(today);
      const cached = coachCache.get(userId);

      if (cached && cached.hash === planHash && (Date.now() - cached.timestamp < CACHE_TTL)) {
        coachMessage = cached.coachMessage;
      } else {
        coachMessage = await ai.generateCoachMessage(today, estimatedTimeMinutes);
        if (coachMessage) {
          coachCache.set(userId, {
            timestamp: Date.now(),
            hash: planHash,
            coachMessage
          });
        }
      }
    } else {
      // Empty state caching removal if no topics
      coachCache.delete(userId);
    }

    // 5. Calendar (Mocked for UI visualization, 7 days outlook)
    const calendar = [];
    const todayDate = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() + i);
      const dayTopics = i === 0 ? today.length : upcoming.filter(u => u.upcomingDays === i).length;
      calendar.push({
        date: d.toISOString().split('T')[0],
        count: dayTopics
      });
    }

    return {
      summary: {
        estimatedTimeMinutes,
        totalTopicsToday: today.length,
        totalTopicsUpcoming: upcoming.length
      },
      today,
      upcoming,
      calendar,
      coach: coachMessage
    };
  },

  recordAction: async (userId, topic, action, accessToken) => {
    await repository.recordAction(userId, topic, action, accessToken);
    // Invalidate AI cache for this user since their next plan will change
    coachCache.delete(userId);
  }
};

module.exports = service;
