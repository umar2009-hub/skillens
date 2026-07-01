const revisionService = require('./revision.service');

const revisionController = {
  getRevisionPlan: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const plan = await revisionService.generateRevisionPlan(req.user.id, req.accessToken);
      return res.status(200).json(plan);
    } catch (error) {
      console.error('Error fetching revision plan:', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch revision plan' });
    }
  },
  
  recordRevisionAction: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const { topic, action } = req.body;
      if (!topic || !action) {
        return res.status(400).json({ error: 'Topic and action are required' });
      }

      await revisionService.recordAction(req.user.id, topic, action, req.accessToken);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error recording revision action:', error);
      return res.status(500).json({ error: error.message || 'Failed to record action' });
    }
  }
};

module.exports = revisionController;
