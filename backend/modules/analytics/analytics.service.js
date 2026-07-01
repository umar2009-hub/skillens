const analyticsRepository = require('./analytics.repository');
const calculations = require('./analytics.calculations');

// Lightweight in-memory cache
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

const analyticsService = {
  generateDashboardAnalytics: async (userId, accessToken) => {
    // 1. Check cache
    const cached = cache.get(userId);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }

    // 2. Fetch raw data in parallel
    const rawData = await analyticsRepository.fetchUserRawData(userId, accessToken);

    // 3. Compute sections
    const overview = calculations.calculateOverview(rawData);
    const topics = calculations.calculateTopics(rawData);
    const charts = calculations.calculateCharts(rawData);

    // 4. Construct final payload
    const dashboardData = {
      overview,
      performance: {
        knowledgeGrowth: charts.growth
      },
      activity: {
        recentDays: charts.activity
      },
      topics,
      dna: {
        // Fallback or aggregated DNA snapshot
        snapshot: rawData.learningDNA.length > 0 ? rawData.learningDNA[0] : null
      },
      charts
    };

    // 5. Update cache
    cache.set(userId, {
      timestamp: Date.now(),
      data: dashboardData
    });

    return dashboardData;
  }
};

module.exports = analyticsService;
