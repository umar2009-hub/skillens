const analyticsUtils = {
  getUniqueDays: (dateStrings) => {
    const days = new Set();
    dateStrings.forEach(ds => {
      if (!ds) return;
      const d = new Date(ds);
      if (!isNaN(d.getTime())) {
        days.add(d.toISOString().split('T')[0]);
      }
    });
    return Array.from(days).sort();
  },

  calculateStreak: (sortedUniqueDays) => {
    if (!sortedUniqueDays || sortedUniqueDays.length === 0) return 0;
    
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    const reversedDays = [...sortedUniqueDays].reverse();

    if (reversedDays[0] !== today && reversedDays[0] !== yesterday) {
      return 0; // Streak broken
    }

    let checkDate = new Date(reversedDays[0]);
    for (let i = 0; i < reversedDays.length; i++) {
      if (reversedDays[i] === checkDate.toISOString().split('T')[0]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  },

  calculateLongestStreak: (sortedUniqueDays) => {
    if (!sortedUniqueDays || sortedUniqueDays.length === 0) return 0;
    
    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedUniqueDays.length; i++) {
      const prevDate = new Date(sortedUniqueDays[i - 1]);
      const currDate = new Date(sortedUniqueDays[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    }

    return longestStreak;
  },
  
  groupActivityByWeekOrMonth: (dates, interval = 'week') => {
    // This can be expanded to return standard chart sets
    const counts = {};
    dates.forEach(d => {
      const date = new Date(d);
      if (isNaN(date.getTime())) return;
      
      const key = date.toISOString().split('T')[0]; // Simple daily for now, can aggregate
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }
};

module.exports = analyticsUtils;
