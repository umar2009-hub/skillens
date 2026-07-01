const analyticsService = require('./analytics.service');

const analyticsController = {
  getDashboardAnalytics: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const analytics = await analyticsService.generateDashboardAnalytics(req.user.id, req.accessToken);
      return res.status(200).json(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch analytics' });
    }
  }
};

module.exports = analyticsController;
