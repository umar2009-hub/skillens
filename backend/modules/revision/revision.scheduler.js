const utils = require('./revision.utils');

const scheduler = {
  buildPlans: (rankedTopics, revisionHistory) => {
    // 1. Group revision history by topic to find the last completed revision
    const historyMap = {};
    revisionHistory.forEach(history => {
      if (history.status !== 'completed') return;
      if (!historyMap[history.topic]) {
        historyMap[history.topic] = [];
      }
      historyMap[history.topic].push(new Date(history.completed_at));
    });

    const todayPlan = [];
    const upcomingPlan = [];
    let totalEstimatedTime = 0;

    rankedTopics.forEach(ranked => {
      const history = historyMap[ranked.topic];
      let nextRevisionDays = utils.intervals[0]; // default 1 day

      if (history && history.length > 0) {
        // Find interval based on how many times they completed it
        const intervalIndex = Math.min(history.length - 1, utils.intervals.length - 1);
        nextRevisionDays = utils.intervals[intervalIndex];
        
        const lastCompleted = history[0]; // It's ordered desc in repository
        const daysSinceLastComplete = utils.getDaysSince(lastCompleted);

        // If the days since last complete is greater than or equal to the scheduled interval, it goes to TODAY
        if (daysSinceLastComplete >= nextRevisionDays) {
          todayPlan.push(ranked);
          totalEstimatedTime += (ranked.averageTime * 3); // Estimate 3 questions worth of time
        } else {
          // Otherwise it's upcoming
          const upcomingDays = nextRevisionDays - daysSinceLastComplete;
          upcomingPlan.push({ ...ranked, upcomingDays });
        }
      } else {
        // Never completed a formal revision, so if it's ranked high, it goes to today
        if (ranked.score > 40 || todayPlan.length < 3) {
          todayPlan.push(ranked);
          totalEstimatedTime += (ranked.averageTime * 3);
        } else {
          upcomingPlan.push({ ...ranked, upcomingDays: 1 });
        }
      }
    });

    // Cap today's plan to max 5 items so we don't overwhelm
    const cappedToday = todayPlan.slice(0, 5);
    // Push the rest back to upcoming
    const overflow = todayPlan.slice(5).map(t => ({ ...t, upcomingDays: 1 }));
    
    return {
      today: cappedToday,
      upcoming: [...upcomingPlan, ...overflow].sort((a, b) => a.upcomingDays - b.upcomingDays).slice(0, 10),
      estimatedTimeMinutes: Math.ceil(totalEstimatedTime / 60) || 15
    };
  }
};

module.exports = scheduler;
